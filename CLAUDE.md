# securitytxt

Jahia OSGi **site-level** module that manages the `/.well-known/security.txt` file content for Jahia sites. Admin UI at `/jahia/administration/{siteKey}/securitytxt`.

## Key Facts

- **artifactId**: `securitytxt` | **version**: `2.0.4-SNAPSHOT`
- **Java package**: `org.jahia.community.securitytxt`
- **jahia-depends**: `default,siteSettings,graphql-dxm-provider`
- Site-level admin route — not server-level
- Settings stored in JCR; served as `/.well-known/security.txt` by a Jahia filter/servlet

## Architecture

| Class | Role |
|-------|------|
| `SecurityTxtQueryExtension` | Queries: settings, file pickers, page pickers |
| `SecurityTxtMutationExtension` | Mutation: create-or-update settings node |
| `GqlSecurityTxt` | Return type with all security.txt fields |
| `GqlFileItem` | `{path, uuid, name, displayableName}` for pickers |

Settings node: `/sites/{siteKey}/securitytxt` (type `jnt:securitytxt`).  
String fields are stored as JCR string properties; reference fields (acknowledgments, encryption, hiring, policy) store a JCR reference by UUID.

## GraphQL API

| Operation | Name | Notes |
|-----------|------|-------|
| Query | `securityTxtSettings(siteKey!)` → `GqlSecurityTxt` | Returns null if site doesn't exist; auto-creates node on first save only |
| Query | `securityTxtFiles(siteKey!, searchTerm)` → `[GqlFileItem]` | Returns `jnt:file` nodes under `/sites/{siteKey}/files` |
| Query | `securityTxtPages(siteKey!, searchTerm)` → `[GqlFileItem]` | Returns `jnt:page` nodes under `/sites/{siteKey}/home` |
| Mutation | `updateSecurityTxt(siteKey!, contact, expires, acknowledgments, acknowledgmentsUrl, canonical, encryption, encryptionUrl, hiring, hiringUrl, policy, policyUrl, preferredLanguages)` → `GqlSecurityTxt` | All fields optional (null = clear) |

Permission: `siteAdminSecurityTxt` (checked via `callerSession.getNode(sitePath).hasPermission(...)` — both query and mutation).

## Field Semantics

Reference fields (`acknowledgments`, `encryption`, `hiring`, `policy`) accept a **UUID**; the picker queries provide UUIDs of available files/pages. Corresponding URL fields (`acknowledgmentsUrl`, `encryptionUrl`, etc.) accept a plain string URL as an alternative when no JCR node is used.

Blank value → property is removed from the node (`null` or empty string clears the field).

## Build

```bash
mvn clean install
yarn build
yarn lint
```

- Admin route target: `administration-sites:999`
- Route key: `securitytxt`
- `requiredPermission: 'siteAdminSecurityTxt'`

## Tests (Cypress Docker)

```bash
cd tests
cp .env.example .env
yarn install
./ci.build.sh && ./ci.startup.sh
```

- Tests: `tests/cypress/e2e/01-securitytxt.cy.ts`
- Admin path: `/jahia/administration/{siteKey}/securitytxt`
- Tests cover: read settings, save settings (all fields), clear fields, `/.well-known/security.txt` HTTP response

## Gotchas

- `securityTxtSettings` returns a `GqlSecurityTxt` with all-null fields (not null itself) when the node doesn't exist yet — the UI must handle this case
- Reference property resolution: if a referenced node no longer exists, `getRefPropUUID` returns `null` (swallows `ItemNotFoundException`) — the UI should handle stale UUIDs gracefully
- The picker query excludes nodes under non-default VFS mount points via JCR provider filtering — mounted folders won't appear in the file picker
- The `callerSession` permission check is done on the user's session (not system session) to enforce site admin scoping; do not remove this check when editing
