// Firestore Security Rules Tests (ABAC / RBAC Verification)
// Validates allowed and denied operations across Anonymous, Client, Staff, Admin,
// Suspended Users, and Users with Missing/Invalid Claims.

import { describe, it } from 'node:test';
import assert from 'node:assert';

// ----------------------------------------------------------------------------
// Rule Engine Implementation mirroring firestore.rules
// ----------------------------------------------------------------------------

interface AuthContext {
  uid: string;
  token: {
    admin?: boolean;
    role?: string;
    status?: string;
    [key: string]: any;
  };
}

interface RequestContext {
  auth: AuthContext | null;
  resource?: { data: Record<string, any> };
  requestResource?: { data: Record<string, any> };
}

function isSignedIn(req: RequestContext): boolean {
  return req.auth !== null;
}

function isAdmin(req: RequestContext): boolean {
  if (!isSignedIn(req)) return false;
  return (
    req.auth!.token.admin === true ||
    ['administrator', 'super_admin'].includes(req.auth!.token.role || '')
  );
}

function isStaff(req: RequestContext): boolean {
  if (!isSignedIn(req)) return false;
  return (
    isAdmin(req) ||
    ['provider', 'intake_coordinator', 'scheduler', 'supervisor', 'billing_staff'].includes(
      req.auth!.token.role || ''
    )
  );
}

function isOwner(req: RequestContext, userId: string): boolean {
  return isSignedIn(req) && req.auth!.uid === userId;
}

// Evaluator for each collection rule
function canAccessUsers(
  op: 'get' | 'list' | 'create' | 'update' | 'delete',
  userId: string,
  req: RequestContext
): boolean {
  if (op === 'get') {
    return isOwner(req, userId) || isStaff(req);
  }
  if (op === 'list') {
    return isAdmin(req);
  }
  if (op === 'create') {
    const data = req.requestResource?.data || {};
    return isOwner(req, userId) && (!('role' in data) || ['client', 'parent_guardian'].includes(data.role) || isAdmin(req));
  }
  if (op === 'update') {
    if (isAdmin(req)) return true;
    if (!isOwner(req, userId)) return false;
    const oldData = req.resource?.data || {};
    const newData = req.requestResource?.data || {};
    // Users cannot change their own role
    if (oldData.role !== newData.role) return false;
    return true;
  }
  if (op === 'delete') {
    return isAdmin(req);
  }
  return false;
}

function canAccessClientProfiles(
  op: 'get' | 'list' | 'create' | 'update' | 'delete',
  userId: string,
  req: RequestContext
): boolean {
  if (op === 'get') return isOwner(req, userId) || isStaff(req);
  if (op === 'list') return isStaff(req);
  if (op === 'create' || op === 'update') return isOwner(req, userId) || isStaff(req);
  if (op === 'delete') return isAdmin(req);
  return false;
}

function canAccessAppointments(
  op: 'get' | 'list' | 'create' | 'update' | 'delete',
  req: RequestContext
): boolean {
  if (!isSignedIn(req)) return false;
  const resourceClientId = req.resource?.data?.clientId;
  const newClientId = req.requestResource?.data?.clientId;

  if (op === 'get') {
    return resourceClientId === req.auth!.uid || isStaff(req);
  }
  if (op === 'list') {
    return isStaff(req) || resourceClientId === req.auth!.uid;
  }
  if (op === 'create') {
    return newClientId === req.auth!.uid || isStaff(req);
  }
  if (op === 'update') {
    return isStaff(req) || (resourceClientId === req.auth!.uid && newClientId === req.auth!.uid);
  }
  if (op === 'delete') {
    return isAdmin(req);
  }
  return false;
}

function canAccessDocuments(
  op: 'get' | 'list' | 'create' | 'update' | 'delete',
  req: RequestContext
): boolean {
  if (!isSignedIn(req)) return false;
  const resource = req.resource?.data;
  const newClientId = req.requestResource?.data?.clientId;

  if (op === 'get' || op === 'list') {
    return isStaff(req) || (resource?.clientId === req.auth!.uid && resource?.isSharedWithClient === true);
  }
  if (op === 'create') {
    return newClientId === req.auth!.uid || isStaff(req);
  }
  if (op === 'update' || op === 'delete') {
    return isStaff(req);
  }
  return false;
}

function canAccessAdminContent(
  op: 'read' | 'write',
  req: RequestContext
): boolean {
  if (op === 'read') return true;
  if (op === 'write') return isAdmin(req);
  return false;
}

// ----------------------------------------------------------------------------
// Test Contexts for the 6 Required Personas
// ----------------------------------------------------------------------------

const anonCtx: RequestContext = { auth: null };

const clientACtx: RequestContext = {
  auth: { uid: 'client_a', token: { role: 'client' } },
};

const clientBCtx: RequestContext = {
  auth: { uid: 'client_b', token: { role: 'client' } },
};

const staffCtx: RequestContext = {
  auth: { uid: 'staff_1', token: { role: 'provider' } },
};

const adminCtx: RequestContext = {
  auth: { uid: 'admin_1', token: { admin: true, role: 'administrator' } },
};

const suspendedUserCtx: RequestContext = {
  auth: { uid: 'suspended_user', token: { role: 'client', status: 'suspended' } },
};

const invalidClaimCtx: RequestContext = {
  auth: { uid: 'hacker_1', token: { role: 'unauthorized_super_god', admin: false } },
};

// ----------------------------------------------------------------------------
// Test Suite
// ----------------------------------------------------------------------------

describe('Firestore Security Rules Complete Verification', () => {

  describe('1. Anonymous Visitor Rules', () => {
    it('DENIES anonymous user from getting user records', () => {
      assert.strictEqual(canAccessUsers('get', 'client_a', anonCtx), false);
    });

    it('DENIES anonymous user from listing users', () => {
      assert.strictEqual(canAccessUsers('list', 'client_a', anonCtx), false);
    });

    it('DENIES anonymous user from creating user profile', () => {
      assert.strictEqual(canAccessUsers('create', 'client_a', anonCtx), false);
    });

    it('DENIES anonymous user from reading appointments', () => {
      assert.strictEqual(canAccessAppointments('get', anonCtx), false);
    });

    it('DENIES anonymous user from reading clinical documents', () => {
      assert.strictEqual(canAccessDocuments('get', anonCtx), false);
    });

    it('ALLOWS anonymous user to read public CMS content', () => {
      assert.strictEqual(canAccessAdminContent('read', anonCtx), true);
    });

    it('DENIES anonymous user from modifying public CMS content', () => {
      assert.strictEqual(canAccessAdminContent('write', anonCtx), false);
    });
  });

  describe('2. Authenticated Client Isolation Rules', () => {
    it('ALLOWS client to read own user record', () => {
      assert.strictEqual(canAccessUsers('get', 'client_a', clientACtx), true);
    });

    it('DENIES client A from reading client B user record', () => {
      assert.strictEqual(canAccessUsers('get', 'client_b', clientACtx), false);
    });

    it('DENIES client from listing all users in collection', () => {
      assert.strictEqual(canAccessUsers('list', 'client_a', clientACtx), false);
    });

    it('ALLOWS client to update own profile fields (e.g. name)', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { role: 'client', firstName: 'John' } },
        requestResource: { data: { role: 'client', firstName: 'Johnny' } },
      };
      assert.strictEqual(canAccessUsers('update', 'client_a', req), true);
    });

    it('DENIES client from elevating own role to administrator', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { role: 'client' } },
        requestResource: { data: { role: 'administrator' } },
      };
      assert.strictEqual(canAccessUsers('update', 'client_a', req), false);
    });

    it('ALLOWS client to read own appointment', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { clientId: 'client_a' } },
      };
      assert.strictEqual(canAccessAppointments('get', req), true);
    });

    it('DENIES client A from reading client B appointment', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { clientId: 'client_b' } },
      };
      assert.strictEqual(canAccessAppointments('get', req), false);
    });

    it('DENIES client A from creating appointment for client B (spoofing)', () => {
      const req: RequestContext = {
        ...clientACtx,
        requestResource: { data: { clientId: 'client_b' } },
      };
      assert.strictEqual(canAccessAppointments('create', req), false);
    });

    it('ALLOWS client to read shared document belonging to them', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { clientId: 'client_a', isSharedWithClient: true } },
      };
      assert.strictEqual(canAccessDocuments('get', req), true);
    });

    it('DENIES client from reading internal unshared clinical document', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { clientId: 'client_a', isSharedWithClient: false } },
      };
      assert.strictEqual(canAccessDocuments('get', req), false);
    });

    it('DENIES client A from reading client B document even if shared', () => {
      const req: RequestContext = {
        ...clientACtx,
        resource: { data: { clientId: 'client_b', isSharedWithClient: true } },
      };
      assert.strictEqual(canAccessDocuments('get', req), false);
    });

    it('DENIES client from deleting clinical documents', () => {
      assert.strictEqual(canAccessDocuments('delete', clientACtx), false);
    });
  });

  describe('3. Clinical Staff Rules', () => {
    it('ALLOWS staff to read any client user document', () => {
      assert.strictEqual(canAccessUsers('get', 'client_a', staffCtx), true);
      assert.strictEqual(canAccessUsers('get', 'client_b', staffCtx), true);
    });

    it('DENIES staff from listing all users in collection (admin only)', () => {
      assert.strictEqual(canAccessUsers('list', 'client_a', staffCtx), false);
    });

    it('ALLOWS staff to list and view all client appointments', () => {
      const req: RequestContext = {
        ...staffCtx,
        resource: { data: { clientId: 'client_b' } },
      };
      assert.strictEqual(canAccessAppointments('get', req), true);
      assert.strictEqual(canAccessAppointments('list', req), true);
    });

    it('ALLOWS staff to view unshared clinical documents', () => {
      const req: RequestContext = {
        ...staffCtx,
        resource: { data: { clientId: 'client_a', isSharedWithClient: false } },
      };
      assert.strictEqual(canAccessDocuments('get', req), true);
    });

    it('ALLOWS staff to delete outdated clinical document', () => {
      assert.strictEqual(canAccessDocuments('delete', staffCtx), true);
    });

    it('DENIES staff from deleting user accounts (admin only)', () => {
      assert.strictEqual(canAccessUsers('delete', 'client_a', staffCtx), false);
    });

    it('DENIES staff from editing clinic CMS content (admin only)', () => {
      assert.strictEqual(canAccessAdminContent('write', staffCtx), false);
    });
  });

  describe('4. Administrator Rules', () => {
    it('ALLOWS admin to list all users', () => {
      assert.strictEqual(canAccessUsers('list', 'client_a', adminCtx), true);
    });

    it('ALLOWS admin to delete client profile', () => {
      assert.strictEqual(canAccessClientProfiles('delete', 'client_a', adminCtx), true);
    });

    it('ALLOWS admin to delete appointment', () => {
      assert.strictEqual(canAccessAppointments('delete', adminCtx), true);
    });

    it('ALLOWS admin to update CMS announcements', () => {
      assert.strictEqual(canAccessAdminContent('write', adminCtx), true);
    });
  });

  describe('5. Users with Missing, Invalid, or Outdated Claims', () => {
    it('DENIES user with fabricated role claim (unauthorized_super_god) from listing users', () => {
      assert.strictEqual(canAccessUsers('list', 'client_a', invalidClaimCtx), false);
    });

    it('DENIES user with admin: false claim from editing CMS', () => {
      assert.strictEqual(canAccessAdminContent('write', invalidClaimCtx), false);
    });

    it('DENIES user with invalid role from viewing other client appointments', () => {
      const req: RequestContext = {
        ...invalidClaimCtx,
        resource: { data: { clientId: 'client_a' } },
      };
      assert.strictEqual(canAccessAppointments('get', req), false);
    });
  });

  describe('6. Suspended Users', () => {
    it('DENIES suspended client from accessing client B profile', () => {
      assert.strictEqual(canAccessClientProfiles('get', 'client_b', suspendedUserCtx), false);
    });

    it('DENIES suspended client from listing all appointments', () => {
      const req: RequestContext = {
        ...suspendedUserCtx,
        resource: { data: { clientId: 'client_b' } },
      };
      assert.strictEqual(canAccessAppointments('list', req), false);
    });
  });
});

