import { RecordingChunk, SessionRecording, RecordingStatus } from '../types/clinical';

const DB_NAME = 'hcs_offline_recordings_db_v1';
const DB_VERSION = 1;
const STORE_CHUNKS = 'recording_chunks';
const STORE_MANIFESTS = 'recording_manifests';
const STORE_DEVICE = 'device_authorization';

// Inactivity timer threshold (15 minutes)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

interface StoredEncryptedChunk {
  id: string; // `${recordingId}_${chunkIndex}`
  recordingId: string;
  chunkIndex: number;
  byteSize: number;
  sha256Checksum: string;
  encryptedBase64Data: string;
  ivBase64: string;
  capturedAt: string;
  uploaded: boolean;
  serverVerified: boolean;
}

interface StoredManifest {
  recordingId: string;
  sessionId: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  modality: string;
  status: RecordingStatus;
  consentObtained: boolean;
  totalChunks: number;
  isSealed: boolean;
  sealedAt?: string;
  deviceId: string;
  createdAt: string;
}

// Compute SHA-256 hex string using Web Crypto API
export async function computeChecksum(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate an encryption key or derive from device authorization
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  const existingKeyJson = sessionStorage.getItem('hcs_device_session_key');
  if (existingKeyJson) {
    const keyData = JSON.parse(existingKeyJson);
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem('hcs_device_session_key', JSON.stringify(exported));
  return key;
}

// Open IndexedDB instance safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
        chunkStore.createIndex('by_recording', 'recordingId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_MANIFESTS)) {
        db.createObjectStore(STORE_MANIFESTS, { keyPath: 'recordingId' });
      }
      if (!db.objectStoreNames.contains(STORE_DEVICE)) {
        db.createObjectStore(STORE_DEVICE, { keyPath: 'deviceId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --------------------------------------------------------------------------
// Device Binding & Security
// --------------------------------------------------------------------------

export async function getApprovedDeviceId(): Promise<string> {
  let devId = localStorage.getItem('hcs_approved_device_id');
  if (!devId) {
    devId = `dev-${crypto.randomUUID()}`;
    localStorage.setItem('hcs_approved_device_id', devId);
  }
  return devId;
}

// --------------------------------------------------------------------------
// Offline Recording Storage & Synchronization
// --------------------------------------------------------------------------

export async function initOfflineRecording(params: {
  recordingId: string;
  sessionId: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  modality: string;
  consentObtained: boolean;
}): Promise<void> {
  if (!params.consentObtained) {
    throw new Error('Recording consent must be explicitly granted before starting offline capture.');
  }

  const db = await openDB();
  const deviceId = await getApprovedDeviceId();

  const manifest: StoredManifest = {
    ...params,
    status: 'recording_locally',
    totalChunks: 0,
    isSealed: false,
    deviceId,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFESTS, 'readwrite');
    tx.objectStore(STORE_MANIFESTS).put(manifest);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveEncryptedChunk(
  recordingId: string,
  chunkIndex: number,
  audioBlob: Blob
): Promise<RecordingChunk> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const checksum = await computeChecksum(arrayBuffer);
  const key = await getOrCreateEncryptionKey();

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );

  // Convert to base64 for safe storage
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  const storedChunk: StoredEncryptedChunk = {
    id: `${recordingId}_${chunkIndex}`,
    recordingId,
    chunkIndex,
    byteSize: arrayBuffer.byteLength,
    sha256Checksum: checksum,
    encryptedBase64Data: encryptedBase64,
    ivBase64,
    capturedAt: new Date().toISOString(),
    uploaded: false,
    serverVerified: false,
  };

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_CHUNKS, STORE_MANIFESTS], 'readwrite');
    tx.objectStore(STORE_CHUNKS).put(storedChunk);
    
    // Update manifest chunk count
    const manifestStore = tx.objectStore(STORE_MANIFESTS);
    const req = manifestStore.get(recordingId);
    req.onsuccess = () => {
      if (req.result) {
        req.result.totalChunks = Math.max(req.result.totalChunks, chunkIndex + 1);
        manifestStore.put(req.result);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return {
    chunkIndex,
    byteSize: arrayBuffer.byteLength,
    sha256Checksum: checksum,
    capturedAt: storedChunk.capturedAt,
    uploaded: false,
    serverVerified: false,
  };
}

export async function sealRecording(recordingId: string): Promise<StoredManifest | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFESTS, 'readwrite');
    const store = tx.objectStore(STORE_MANIFESTS);
    const req = store.get(recordingId);
    req.onsuccess = () => {
      const manifest: StoredManifest = req.result;
      if (manifest) {
        manifest.isSealed = true;
        manifest.status = 'sealed';
        manifest.sealedAt = new Date().toISOString();
        store.put(manifest);
        resolve(manifest);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingOfflineRecordings(): Promise<StoredManifest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFESTS, 'readonly');
    const req = tx.objectStore(STORE_MANIFESTS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeVerifiedOfflineRecording(recordingId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_CHUNKS, STORE_MANIFESTS], 'readwrite');
    const chunkStore = tx.objectStore(STORE_CHUNKS);
    const index = chunkStore.index('by_recording');
    const req = index.getAllKeys(recordingId);
    
    req.onsuccess = () => {
      const keys = req.result;
      for (const k of keys) {
        chunkStore.delete(k);
      }
      tx.objectStore(STORE_MANIFESTS).delete(recordingId);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
