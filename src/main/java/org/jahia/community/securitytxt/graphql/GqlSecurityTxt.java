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
    private final String canonical;
    private final String encryption;
    private final String hiring;
    private final String policy;
    private final String preferredLanguages;

    public GqlSecurityTxt(String siteKey, String contact, String expires, String acknowledgments,
            String canonical, String encryption, String hiring, String policy, String preferredLanguages) {
        this.siteKey = siteKey;
        this.contact = contact;
        this.expires = expires;
        this.acknowledgments = acknowledgments;
        this.canonical = canonical;
        this.encryption = encryption;
        this.hiring = hiring;
        this.policy = policy;
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
    @GraphQLDescription("UUID of the hiring/careers page node")
    public String getHiring() {
        return hiring;
    }

    @GraphQLField
    @GraphQLDescription("UUID of the security policy page node")
    public String getPolicy() {
        return policy;
    }

    @GraphQLField
    @GraphQLDescription("Preferred languages for vulnerability reports (comma-separated RFC 5646 tags)")
    public String getPreferredLanguages() {
        return preferredLanguages;
    }
}
