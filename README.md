# security.txt

The purpose of this module is to ease the generation of the file **security.txt** inside [Digital Experience Manager](https://www.jahia.com).
For more information about **security.txt**, please refer to https://securitytxt.org/ (RFC 9116).

# Installation

- In DX, go to **Administration → Server settings → System components → Modules**
- Upload the JAR **securitytxt-X.X.X.jar**
- Check that the module is started

# Use

## Administration

- Go to **Administration → Server settings → Web Projects**
- Edit the site with which you want to use this module and add it to the list of deployed modules

## Site settings

- Go to **Administration → `<your-site>` → Security.txt** (`/jahia/administration/{siteKey}/securitytxt`)
- Fill in the required fields (Contact and Expires) and any optional fields
- Click **Update** to save

The generated file is served at `/.well-known/security.txt`.

## Permission

Access to the Security.txt admin page requires the `siteAdminSecurityTxt` permission on the site node.
Assign this permission via **Administration → `<your-site>` → Roles & permissions**.

## GraphQL API

The module exposes a GraphQL API via the `graphql-dxm-provider` extension point.

### Queries

```graphql
# Retrieve current settings for a site
query {
  securityTxtSettings(siteKey: "mySite") {
    siteKey contact expires canonical
    acknowledgments acknowledgmentsUrl
    encryption encryptionUrl
    hiring hiringUrl
    policy policyUrl
    preferredLanguages
  }
}

# List JCR files available for the encryption/signature picker
query {
  securityTxtFiles(siteKey: "mySite", searchTerm: "pgp") {
    uuid name path displayableName
  }
}

# List JCR pages available for acknowledgments/policy/hiring pickers
query {
  securityTxtPages(siteKey: "mySite", searchTerm: "") {
    uuid name path displayableName
  }
}
```

### Mutation

```graphql
mutation {
  updateSecurityTxt(
    siteKey: "mySite"
    contact: "mailto:security@example.com"
    expires: "2026-12-31T23:59:59.000+00:00"
    canonical: "https://example.com/.well-known/security.txt"
    # Reference fields accept a JCR node UUID from the picker queries
    # acknowledgments: "<uuid>"
    # URL alternatives (https: or mailto: URIs only)
    acknowledgmentsUrl: "https://example.com/security/acknowledgments"
    policyUrl: "https://example.com/security/policy"
    preferredLanguages: "en, fr"
  ) {
    siteKey contact expires
  }
}
```

All URL fields (`canonical`, `acknowledgmentsUrl`, `encryptionUrl`, `hiringUrl`, `policyUrl`)
accept only `https:` or `mailto:` URIs. The `contact` field accepts `mailto:` or `https:` URIs.
Invalid values or values containing newline characters are rejected.
