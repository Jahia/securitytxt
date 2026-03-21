package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("SecurityTxt")
@GraphQLDescription("Security.txt configuration for a Jahia site")
public class GqlSecurityTxt {

    private final String siteKey;
    private final String contact;
    private final String encryption;
    private final String acknowledgements;
    private final String policy;
    private final String signature;
    private final String hiring;

    public GqlSecurityTxt(String siteKey, String contact, String encryption,
            String acknowledgements, String policy, String signature, String hiring) {
        this.siteKey = siteKey;
        this.contact = contact;
        this.encryption = encryption;
        this.acknowledgements = acknowledgements;
        this.policy = policy;
        this.signature = signature;
        this.hiring = hiring;
    }

    @GraphQLField
    @GraphQLName("siteKey")
    @GraphQLDescription("The site key")
    public String getSiteKey() {
        return siteKey;
    }

    @GraphQLField
    @GraphQLName("contact")
    @GraphQLDescription("The security contact address (email or URL)")
    public String getContact() {
        return contact;
    }

    @GraphQLField
    @GraphQLName("encryption")
    @GraphQLDescription("UUID of the PGP key file node")
    public String getEncryption() {
        return encryption;
    }

    @GraphQLField
    @GraphQLName("acknowledgements")
    @GraphQLDescription("UUID of the security acknowledgements page node")
    public String getAcknowledgements() {
        return acknowledgements;
    }

    @GraphQLField
    @GraphQLName("policy")
    @GraphQLDescription("UUID of the security policy page node")
    public String getPolicy() {
        return policy;
    }

    @GraphQLField
    @GraphQLName("signature")
    @GraphQLDescription("UUID of the signature file node")
    public String getSignature() {
        return signature;
    }

    @GraphQLField
    @GraphQLName("hiring")
    @GraphQLDescription("UUID of the hiring/careers page node")
    public String getHiring() {
        return hiring;
    }
}
