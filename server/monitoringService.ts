export interface IncidentResponseContact {
  role: string;
  name: string;
  email: string;
  phone: string;
  escalationTier: 1 | 2 | 3;
}

export const INCIDENT_RESPONSE_CONTACTS: IncidentResponseContact[] = [
  {
    role: 'Primary Security & Systems Officer',
    name: 'Clinical Infrastructure Lead',
    email: 'security@hopecommunitysupport.org',
    phone: '(555) 234-9901',
    escalationTier: 1,
  },
  {
    role: 'HIPAA Compliance Officer & Privacy Director',
    name: 'David Ross',
    email: 'compliance@hopecommunitysupport.org',
    phone: '(555) 234-9902',
    escalationTier: 1,
  },
  {
    role: 'Executive Medical Director & On-Call Clinician',
    name: 'Dr. Sarah Jenkins',
    email: 'clinical-director@hopecommunitysupport.org',
    phone: '(555) 234-9903',
    escalationTier: 2,
  },
  {
    role: 'Cloud Operations & Disaster Recovery Coordinator',
    name: 'Cloud Operations Team',
    email: 'cloud-ops@hopecommunitysupport.org',
    phone: '(555) 234-9904',
    escalationTier: 3,
  },
];

export const ROLLBACK_PROCEDURE = {
  summary: 'Standard Operating Procedure (SOP) for Cloud Run and Firestore rollbacks',
  steps: [
    '1. Identify anomalous telemetry: Alert trigger in Cloud Monitoring (5xx error rate > 1%, auth failures > 20/min, or security rule denials spike).',
    '2. Route traffic back to previous stable Cloud Run revision via console: gcloud run services update-traffic hope-community-support --to-revisions=STABLE_REVISION=100.',
    '3. If database regression is detected, execute controlled restore from verified snapshot using /api/admin/backup/restore with target backup ID.',
    '4. Verify system health via /api/health and /api/monitoring/metrics (target 200 OK across all probes).',
    '5. Notify Incident Response Contacts Tier 1 and file incident post-mortem within 24 hours pursuant to HIPAA breach notification standards.',
  ],
};

// Sensitive field keys to automatically redact in structured logs
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'pass',
  'smtp_pass',
  'token',
  'authorization',
  'authtoken',
  'refreshtoken',
  'idtoken',
  'cookie',
  'set-cookie',
  'secret',
  'apikey',
  'api_key',
  'ssn',
  'creditcard',
  'cardnumber',
]);

/**
 * Sanitizes arbitrary objects to prevent leaking credentials or PII in logs
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') {
    if (typeof data === 'string' && data.length > 300) {
      return data.substring(0, 300) + '...[truncated]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeLogData(value);
    }
  }
  return sanitized;
}

// In-Memory Telemetry Tracker
class SystemMetricsTracker {
  private startTime = Date.now();
  private totalRequests = 0;
  private statusCodes: Record<string, number> = {};
  private securityRuleDenials = 0;
  private failedLoginAttempts = 0;
  private emailDispatchCount = 0;
  private emailFailureCount = 0;
  private recentAnomalies: Array<{ type: string; details: string; timestamp: string }> = [];

  public recordRequest(status: number) {
    this.totalRequests++;
    const key = `${Math.floor(status / 100)}xx`;
    this.statusCodes[key] = (this.statusCodes[key] || 0) + 1;
  }

  public recordSecurityDenial(details: string) {
    this.securityRuleDenials++;
    this.addAnomaly('SECURITY_RULE_DENIAL', details);
  }

  public recordFailedLogin(email: string) {
    this.failedLoginAttempts++;
    this.addAnomaly('FAILED_LOGIN_ATTEMPT', `Failed login attempt for user identifier ${email.split('@')[0]}***`);
  }

  public recordEmailAttempt(success: boolean, type: string) {
    this.emailDispatchCount++;
    if (!success) {
      this.emailFailureCount++;
      this.addAnomaly('EMAIL_DELIVERY_FAILURE', `Dispatch failed for template ${type}`);
    }
  }

  private addAnomaly(type: string, details: string) {
    this.recentAnomalies.unshift({
      type,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.recentAnomalies.length > 50) {
      this.recentAnomalies.pop();
    }
  }

  public getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memory = process.memoryUsage();

    return {
      status: 'HEALTHY',
      uptimeSeconds,
      totalRequests: this.totalRequests,
      statusCodes: this.statusCodes,
      securityMetrics: {
        securityRuleDenials: this.securityRuleDenials,
        failedLoginAttempts: this.failedLoginAttempts,
        anomaliesDetected: this.recentAnomalies.length,
      },
      emailMetrics: {
        totalDispatched: this.emailDispatchCount,
        failures: this.emailFailureCount,
        successRate: this.emailDispatchCount > 0
          ? `${(((this.emailDispatchCount - this.emailFailureCount) / this.emailDispatchCount) * 100).toFixed(1)}%`
          : '100%',
      },
      systemResources: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
      recentAnomalies: this.recentAnomalies.slice(0, 10),
    };
  }
}

export const metricsTracker = new SystemMetricsTracker();
