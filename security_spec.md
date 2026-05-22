# Security Specification - GEAX Exchange

## Data Invariants
- A `User` can only modify their own profile.
- A `User` cannot change their own `role` or `isVerified` status once set (or requires admin).
- A `Contract` can only be read by the `buyer` or the `producer` involved (or an admin).
- `Contracts` are created by producers but must be assigned to valid buyers.
- `Contracts` status changes are restricted to authorized parties.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than the authenticated user.
2. **Role Escalation**: Attempt to update a user profile to set `isVerified: true` or change `role`.
3. **Unauthorized Contract Read**: A user attempts to read a contract where they are neither the `buyerId` nor `producerId`.
4. **Shadow Field Injection**: Attempt to add a field like `isAdmin: true` to a user document.
5. **Contract Ownership Takeover**: Attempt to update a contract to change the `buyerId` or `producerId`.
6. **Malicious ID**: Attempt to create a document with an extremely long ID string (resource exhaustion).
7. **Type Poisoning**: Attempt to set `value` (expected string) to a large boolean or object.
8. **PII Leak**: Attempt to list all users to scrape emails.
9. **Timestamp Manipulation**: Attempt to set a past `createdAt` date.
10. **State Skipping**: Attempt to move a contract to "Fully Collateralized" without the required payment verification data (though here we simulate it, the rules should still be strict).
11. **Blanket Query**: Attempt to query `contracts` without a `where` clause filtering by personal participation.
12. **Recursive Cost Attack**: Attempting to use deeply nested paths (if applicable, though we use flat structure here).

## Test Plan
- Verify that `create` on `/users/{uid}` fails if `uid != request.auth.uid`.
- Verify that `update` on `/users/{uid}` fails if `role` or `isVerified` is in `affectedKeys()`.
- Verify that `get` on `/contracts/{id}` fails if `request.auth.uid` is not in `[buyerId, producerId]`.
- Verify that `list` on `contracts` fails if not filtered by `buyerId` or `producerId`.
