package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("SecurityTxt")
@GraphQLDescription("Security.txt configuration for a Jahia site")
public class GqlSecurityTxt {

    private final String siteKey;
    private final String contact;
    private final String expires;
    private final String acknowledgments;
    private final String acknowledgmentsUrl;
    private final String canonical;
    private final String encryption;
    private final String encryptionUrl;
    private final String hiring;
    private final String hiringUrl;
    private final String policy;
    private final String policyUrl;
    private final String preferredLanguages;

    public GqlSecurityTxt(String siteKey, String contact, String expires,
                          String acknowledgments, String acknowledgmentsUrl,
                          String canonical,
                          String encryption, String encryptionUrl,
                          String hiring, String hiringUrl,
                          String policy, String policyUrl,
                          String preferredLanguages) {
        this.siteKey = siteKey;
        this.contact = contact;
        this.expires = expires;
        this.acknowledgments = acknowledgments;
        this.acknowledgmentsUrl = acknowledgmentsUrl;
        this.canonical = canonical;
        this.encryption = encryption;
        this.encryptionUrl = encryptionUrl;
        this.hiring = hiring;
        this.hiringUrl = hiringUrl;
        this.policy = policy;
        this.policyUrl = policyUrl;
        this.preferredLanguages = preferredLanguages;
    }

    @GraphQLField
    @GraphQLDescription("The site key")
    public String getSiteKey() {
        return siteKey;
    }

    @GraphQLField
    @GraphQLDescription("The security contact address (email or URL) — RFC 9116 required field")
    public String getContact() {
        return contact;
    }

    @GraphQLField
    @GraphQLDescription("The expiry date of this file in RFC 3339 format — RFC 9116 required field")
    public String getExpires() {
        return expires;
    }

    @GraphQLField
    @GraphQLDescription("UUID of the security acknowledgments page node")
    public String getAcknowledgments() {
        return acknowledgments;
    }

    @GraphQLField
    @GraphQLDescription("Hardcoded URL for the acknowledgments page")
    public String getAcknowledgmentsUrl() {
        return acknowledgmentsUrl;
    }

    @GraphQLField
    @GraphQLDescription("The canonical URL of this security.txt file")
    public String getCanonical() {
        return canonical;
    }

    @GraphQLField
    @GraphQLDescription("UUID of the PGP key file node")
    public String getEncryption() {
        return encryption;
    }

    @GraphQLField
    @GraphQLDescription("Hardcoded URL for the PGP key file")
    public String getEncryptionUrl() {
        return encryptionUrl;
    }

    @GraphQLField
    @GraphQLDescription("UUID of the hiring/careers page node")
    public String getHiring() {
        return hiring;
    }

    @GraphQLField
    @GraphQLDescription("Hardcoded URL for the hiring/careers page")
    public String getHiringUrl() {
        return hiringUrl;
    }

    @GraphQLField
    @GraphQLDescription("UUID of the security policy page node")
    public String getPolicy() {
        return policy;
    }

    @GraphQLField
    @GraphQLDescription("Hardcoded URL for the security policy page")
    public String getPolicyUrl() {
        return policyUrl;
    }

    @GraphQLField
    @GraphQLDescription("Preferred languages for vulnerability reports (comma-separated RFC 5646 tags)")
    public String getPreferredLanguages() {
        return preferredLanguages;
    }
}
