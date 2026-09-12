import crypto from 'crypto';

export interface BackupSnapshot {
  backupId: string;
  timestamp: string;
  rpoHours: number;
  rtoMinutes: number;
  data: {
    users: any[];
    appointments: any[];
    documents: any[];
    auditLogs: any[];
    messages: any[];
  };
  recordCount: number;
  checksum: string;
}

export interface DataRetentionPolicy {
  clinicalRecordsYears: number; // 7 years standard (pediatric: 7 years past age 18)
  auditLogsYears: number; // 6 years standard HIPAA
  softDeleteGraceDays: number; // 30 days before purge
  allowLegalHoldOverride: boolean;
}

export const RETENTION_POLICY: DataRetentionPolicy = {
  clinicalRecordsYears: 7,
  auditLogsYears: 6,
  softDeleteGraceDays: 30,
  allowLegalHoldOverride: true,
};

// Backup snapshots registry in server memory
const backupStore = new Map<string, BackupSnapshot>();

/**
 * Creates a verified point-in-time backup snapshot
 */
export function createBackupSnapshot(dataSources: {
  users: any[];
  appointments: any[];
  documents: any[];
  auditLogs: any[];
  messages: any[];
}): BackupSnapshot {
  const backupId = `backup_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const timestamp = new Date().toISOString();

  const serialized = JSON.stringify({
    users: dataSources.users,
    appointments: dataSources.appointments,
    documents: dataSources.documents,
    auditLogs: dataSources.auditLogs,
    messages: dataSources.messages,
  });

  const checksum = crypto.createHash('sha256').update(serialized).digest('hex');
  const recordCount =
    dataSources.users.length +
    dataSources.appointments.length +
    dataSources.documents.length +
    dataSources.auditLogs.length +
    dataSources.messages.length;

  const snapshot: BackupSnapshot = {
    backupId,
    timestamp,
    rpoHours: 1, // 1 hour RPO
    rtoMinutes: 15, // 15 minutes RTO
    data: JSON.parse(serialized),
    recordCount,
    checksum,
  };

  backupStore.set(backupId, snapshot);
  return snapshot;
}

/**
 * Controlled Restoration Procedure:
 * Validates cryptographic checksum before restoring state
 */
export function restoreFromBackupSnapshot(
  backupId: string,
  applyRestoreFn: (data: BackupSnapshot['data']) => void
): {
  success: boolean;
  backupId: string;
  recordsRestored: number;
  restorationTimestamp: string;
  error?: string;
} {
  const snapshot = backupStore.get(backupId);
  if (!snapshot) {
    return {
      success: false,
      backupId,
      recordsRestored: 0,
      restorationTimestamp: new Date().toISOString(),
      error: `Backup snapshot ${backupId} not found.`,
    };
  }

  // 1. Verify Cryptographic Integrity Checksum
  const serialized = JSON.stringify(snapshot.data);
  const recomputedChecksum = crypto.createHash('sha256').update(serialized).digest('hex');

  if (recomputedChecksum !== snapshot.checksum) {
    return {
      success: false,
      backupId,
      recordsRestored: 0,
      restorationTimestamp: new Date().toISOString(),
      error: 'CRITICAL: Backup data integrity corrupted. Checksum verification failed.',
    };
  }

  // 2. Apply restoration to live store
  applyRestoreFn(snapshot.data);

  return {
    success: true,
    backupId,
    recordsRestored: snapshot.recordCount,
    restorationTimestamp: new Date().toISOString(),
  };
}

/**
 * Enforce data retention and soft delete purge
 */
export function enforceRetentionPolicies(params: {
  documents: any[];
  users: any[];
  auditLogs: any[];
}): {
  purgedDocuments: number;
  purgedUsers: number;
  retainedLegalHoldCount: number;
  retainedAuditLogsCount: number;
} {
  let purgedDocuments = 0;
  let purgedUsers = 0;
  let retainedLegalHoldCount = 0;

  const now = Date.now();
  const gracePeriodMs = RETENTION_POLICY.softDeleteGraceDays * 24 * 60 * 60 * 1000;

  // Process documents
  for (const doc of params.documents) {
    if (doc.retentionStatus === 'legal_hold') {
      retainedLegalHoldCount++;
      continue;
    }

    if (doc.retentionStatus === 'pending_deletion' && doc.deletionRequestedAt) {
      const timeSinceRequest = now - new Date(doc.deletionRequestedAt).getTime();
      if (timeSinceRequest > gracePeriodMs) {
        doc.isPurged = true;
        purgedDocuments++;
      }
    }
  }

  // Process users
  for (const user of params.users) {
    if (user.legalHold === true) {
      retainedLegalHoldCount++;
      continue;
    }

    if (user.status === 'pending_deletion' && user.deletionRequestedAt) {
      const timeSinceRequest = now - new Date(user.deletionRequestedAt).getTime();
      if (timeSinceRequest > gracePeriodMs) {
        user.status = 'purged';
        purgedUsers++;
      }
    }
  }

  return {
    purgedDocuments,
    purgedUsers,
    retainedLegalHoldCount,
    retainedAuditLogsCount: params.auditLogs.length,
  };
}

/**
 * Purges synthetic test accounts while preserving production records
 */
export function cleanupTestData(users: any[]): { cleanedCount: number } {
  let cleanedCount = 0;
  for (let i = users.length - 1; i >= 0; i--) {
    const u = users[i];
    if (u.isTestData === true || u.email.endsWith('@test.hopecommunitysupport.org')) {
      users.splice(i, 1);
      cleanedCount++;
    }
  }
  return { cleanedCount };
}
