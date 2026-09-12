# Hope Community Support - Security & ABAC Specification

## 1. Data Invariants
- Identity Isolation: A client can only access, view, and mutate their own profile, appointments, service requests, notifications, and shared clinical documents.
- Admin Protection via Custom Claims: Privilege escalation is blocked at the rule level. Administrative access strictly relies on verified Firebase Auth custom claims (`request.auth.token.admin == true` or `request.auth.token.role in ['administrator', 'super_admin']`), never on client-provided body fields.
- Document Privacy: Medical intake forms and uploaded clinical files are isolated per client UID; unshared documents cannot be read by clients even if authenticated.
- Public CMS Safety: Public information (hotline, staff profiles, operating hours) is read-only for unauthenticated visitors and mutable exclusively by verified administrators.

## 2. The "Dirty Dozen" Threat Payloads & Mitigations
1. Client Attempts to Read Another Client's User Record: Blocked by UID match `request.auth.uid == userId`.
2. Client Attempts to Update Self to 'administrator' or 'super_admin': Blocked by rejecting updates that modify the `role` field without admin custom claims.
3. Client Attempts to Query All Clinic Appointments: Blocked by query enforcer rule `resource.data.clientId == request.auth.uid`.
4. Anonymous User Attempts to Create an Appointment: Blocked by `request.auth != null`.
5. Client Attempts to Read Unshared Internal Clinical Note: Blocked by `resource.data.isSharedWithClient == true`.
6. Client Attempts to Overwrite Provider Field in Confirmed Appointment: Blocked by field difference checks.
7. Attacker Injects Oversized Junk String ID (1MB string): Blocked by `isValidId()` regex and length guard (`<= 128`).
8. Attacker Attempts to Modify Admin CMS Announcement: Blocked by `isAdmin()` custom claim verification.
9. Attacker Attempts to Delete Another User's Notifications: Blocked by default deny on delete for notifications.
10. Attacker Attempts to Read Other Clients' Documents: Blocked by `resource.data.clientId == request.auth.uid`.
11. User Attempts to Create Appointment for Another Client's UID: Blocked by checking `request.resource.data.clientId == request.auth.uid`.
12. Forged Role in Token Body without Signed Custom Claims: Firebase Auth engine signs tokens cryptographically; client cannot forge custom claims.
