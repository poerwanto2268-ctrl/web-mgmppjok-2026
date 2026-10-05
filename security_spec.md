# Security Specification for MGMP PJOK SMP

## 1. Data Invariants
1. Settings collection can only be updated by verified administrators (`sutarman811@guru.smp.belajar.id` or designated admin users).
2. Public users can read basic organization settings, announcements, approved learning resources, and public calendar activities.
3. Teacher member profiles can only be created/updated with valid string constraints; members must not overwrite system audit fields.
4. Attendance records must strictly correspond to a valid activityId and memberId; duplicate attendances must be barred.
5. Discussion threads and comments must validate that the author identity matches the authenticated user.
6. Learning resources uploaded by teachers must strictly enforce file types and bounds.

## 2. Dirty Dozen Threat Vectors
1. Spoofed admin role modifying organization identity without verification.
2. Member modifying other members' NIP/NUPTK or school affiliation without authorization.
3. Unauthenticated user writing attendance records without attending the activity.
4. Unauthenticated user altering discussion replies or pinning topics.
5. Injected 10MB payloads in text/title fields to cause denial of wallet.
6. Overwriting an activity status to complete or cancelled by a non-organizer.
7. Shadow update injecting unvetted administrative privilege tags in user profiles.
8. Deletion of audit logs or past historical activities by unauthorized parties.
9. Modifying document access level from 'Pengurus' to 'Publik' without admin privileges.
10. Impersonating another teacher in forum discussion postings.
11. Bypassing attendance QR validation by forging attendance timestamps.
12. Inserting cross-site script payload in learning resource download links.

## 3. Security Rule Invariant Assertions
All collections require strict type, size, and authorization bounds. Verified admin emails and user IDs have elevated management permissions.
