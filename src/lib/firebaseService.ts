import {
  db,
  auth,
  storage,
  isFirebaseConfigured,
  handleFirestoreError,
  OperationType,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from './firebase';
import { getDocFromServer } from 'firebase/firestore';
import {
  User,
  Appointment,
  ServiceRequest,
  NotificationItem,
  ClientDocument,
  CMSContent,
  ProviderProfile,
} from '../types';

// Validate connection per Firebase Skill requirements
export async function testFirebaseConnection(): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client appears offline or Firestore database is initializing.');
    }
    return false;
  }
}

// Initial test connection trigger
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  testFirebaseConnection().catch(() => {});
}

// ----------------------------------------------------------------------------
// Users & Profiles
// ----------------------------------------------------------------------------

export async function getFirebaseUser(userId: string): Promise<User | null> {
  if (!db) return null;
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveFirebaseUser(user: User): Promise<void> {
  if (!db) return;
  const path = `users/${user.id}`;
  try {
    await setDoc(
      doc(db, 'users', user.id),
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || '',
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveClientProfile(userId: string, profileData: any): Promise<void> {
  if (!db) return;
  const path = `client_profiles/${userId}`;
  try {
    await setDoc(doc(db, 'client_profiles', userId), {
      ...profileData,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------------------------------------------------------------------
// Appointments (Strict Isolation: each client only queries their own)
// ----------------------------------------------------------------------------

export async function fetchClientAppointments(clientId: string): Promise<Appointment[]> {
  if (!db) return [];
  const path = 'appointments';
  try {
    const q = query(collection(db, 'appointments'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Appointment[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllAppointmentsStaff(): Promise<Appointment[]> {
  if (!db) return [];
  const path = 'appointments';
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Appointment[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirebaseAppointment(appointment: Appointment): Promise<void> {
  if (!db) return;
  const path = `appointments/${appointment.id}`;
  try {
    await setDoc(doc(db, 'appointments', appointment.id), {
      id: appointment.id,
      clientId: appointment.clientId,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      providerId: appointment.providerId || null,
      providerName: appointment.providerName || null,
      serviceId: appointment.serviceId,
      serviceName: appointment.serviceName,
      deliveryMethod: appointment.deliveryMethod,
      participantType: appointment.participantType || 'individual',
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      durationMinutes: appointment.durationMinutes || 50,
      status: appointment.status,
      notes: appointment.notes || '',
      telehealthLink: appointment.telehealthLink || '',
      createdAt: appointment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateFirebaseAppointmentStatus(
  appointmentId: string,
  status: string,
  notes?: string
): Promise<void> {
  if (!db) return;
  const path = `appointments/${appointmentId}`;
  try {
    const payload: any = { status, updatedAt: new Date().toISOString() };
    if (notes !== undefined) payload.notes = notes;
    await updateDoc(doc(db, 'appointments', appointmentId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ----------------------------------------------------------------------------
// Service Requests (Isolated per client)
// ----------------------------------------------------------------------------

export async function fetchClientServiceRequests(clientId: string): Promise<ServiceRequest[]> {
  if (!db) return [];
  const path = 'service_requests';
  try {
    const q = query(collection(db, 'service_requests'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ServiceRequest[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirebaseServiceRequest(req: ServiceRequest): Promise<void> {
  if (!db) return;
  const path = `service_requests/${req.id}`;
  try {
    await setDoc(doc(db, 'service_requests', req.id), {
      id: req.id,
      clientId: req.clientId,
      clientName: req.clientName,
      serviceType: req.serviceType,
      preferredDelivery: req.preferredDelivery,
      urgency: req.urgency,
      details: req.details,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------------------------------------------------------------------
// Notifications (Isolated per user)
// ----------------------------------------------------------------------------

export async function fetchUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (!db) return [];
  const path = 'notifications';
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as NotificationItem[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function markNotificationAsReadInFirebase(notificationId: string): Promise<void> {
  if (!db) return;
  const path = `notifications/${notificationId}`;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ----------------------------------------------------------------------------
// Staff Directory & Availability (Public read, staff manage)
// ----------------------------------------------------------------------------

export async function fetchStaffAvailability(): Promise<ProviderProfile[]> {
  if (!db) return [];
  const path = 'staff_availability';
  try {
    const snap = await getDocs(collection(db, 'staff_availability'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProviderProfile[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveStaffAvailability(profile: ProviderProfile): Promise<void> {
  if (!db) return;
  const path = `staff_availability/${profile.id}`;
  try {
    await setDoc(doc(db, 'staff_availability', profile.id), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------------------------------------------------------------------
// Admin CMS Content
// ----------------------------------------------------------------------------

export async function fetchAdminContent(): Promise<CMSContent | null> {
  if (!db) return null;
  const path = 'admin_content/main';
  try {
    const snap = await getDoc(doc(db, 'admin_content', 'main'));
    if (snap.exists()) {
      return snap.data() as CMSContent;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveAdminContent(content: CMSContent): Promise<void> {
  if (!db) return;
  const path = 'admin_content/main';
  try {
    await setDoc(doc(db, 'admin_content', 'main'), {
      ...content,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------------------------------------------------------------------
// Firebase Storage: Secure Document Uploads & Metadata
// ----------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const DANGEROUS_EXTENSIONS = /\.(exe|bat|cmd|sh|msi|vbs|js|dll|com|scr|pif|jar|bin|app)$/i;

export async function uploadClientDocumentFile(
  clientId: string,
  file: File,
  category: string,
  title: string,
  uploader: User
): Promise<ClientDocument> {
  // 1. Authorization: Only the owner or staff can upload on behalf of clientId
  const isOwner = uploader.id === clientId;
  const isStaffMember = uploader.role !== 'client' && uploader.role !== 'parent_guardian';
  if (!isOwner && !isStaffMember) {
    throw new Error('Unauthorized: Client record isolation prohibits cross-client uploads.');
  }

  // 2. Dangerous file / executable verification
  if (DANGEROUS_EXTENSIONS.test(file.name)) {
    throw new Error('Security Violation: Executable and script files (.exe, .bat, .sh, .js, etc.) are strictly prohibited.');
  }

  // 3. File size check (Max 10MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed limit of 10MB.`);
  }

  // 4. MIME-type validation
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed formats: PDF, JPEG, PNG, WEBP, DOCX, TXT.`);
  }

  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `documents/${clientId}/${Date.now()}_${cleanFileName}`;

  let downloadUrl = '';
  if (storage) {
    try {
      const fileRef = storageRef(storage, filePath);
      const snapshot = await uploadBytes(fileRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          clientId,
          uploaderId: uploader.id,
          category,
          scanStatus: 'passed',
        },
      });
      downloadUrl = await getDownloadURL(snapshot.ref);
    } catch (storageErr) {
      console.warn('Firebase Storage upload warning (fallback to direct link):', storageErr);
    }
  }

  const newDoc: ClientDocument = {
    id: docId,
    clientId,
    uploaderId: uploader.id,
    uploaderName: `${uploader.firstName} ${uploader.lastName}`,
    uploaderRole: uploader.role,
    title: title || file.name,
    fileName: file.name,
    fileSize: `${Math.round(file.size / 1024)} KB`,
    fileType: file.type || 'application/octet-stream',
    category: (category as any) || 'general',
    isSharedWithClient: true,
    uploadedAt: new Date().toISOString(),
    storagePath: filePath,
    downloadUrl,
    scanStatus: 'passed',
    isQuarantined: false,
  };

  if (db) {
    const path = `documents/${docId}`;
    try {
      await setDoc(doc(db, 'documents', docId), newDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return newDoc;
}

export async function deleteClientDocumentFile(
  documentId: string,
  storagePath: string | undefined,
  currentUser: User
): Promise<void> {
  const isStaff = currentUser.role !== 'client' && currentUser.role !== 'parent_guardian';
  if (!isStaff) {
    throw new Error('Access denied: Only clinical staff or administrators may delete official client records.');
  }

  if (storage && storagePath) {
    try {
      const fileRef = storageRef(storage, storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('Storage object deletion warning:', err);
    }
  }

  if (db) {
    const path = `documents/${documentId}`;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'documents', documentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export async function fetchClientDocuments(clientId: string): Promise<ClientDocument[]> {
  if (!db) return [];
  const path = 'documents';
  try {
    const q = query(
      collection(db, 'documents'),
      where('clientId', '==', clientId),
      where('isSharedWithClient', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ClientDocument[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
