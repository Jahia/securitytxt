package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.*;
import org.apache.commons.lang.StringUtils;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;
import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;
import java.util.regex.Pattern;

@GraphQLTypeExtension(DXGraphQLProvider.Mutation.class)
@GraphQLName("SecurityTxtMutations")
@GraphQLDescription("Security.txt management mutations")
public class SecurityTxtMutationExtension {

    private SecurityTxtMutationExtension() {
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityTxtMutationExtension.class);
    private static final String SECURITY_TXT = "securitytxt";
    private static final String SECURITY_TXT_NODE_TYPE = "jnt:securitytxt";

    /** Matches a mailto: or https: URI for the Contact field (RFC 9116). */
    private static final Pattern CONTACT_PATTERN =
            Pattern.compile("^(mailto:[^\\s]+|https://[^\\s]+)$");
    /** Matches an https: or mailto: URI for URL fields. */
    private static final Pattern URL_FIELD_PATTERN =
            Pattern.compile("^(https://[^\\s]+|mailto:[^\\s]+)$");
    /** CR or LF characters that must never appear in a field value. */
    private static final Pattern CRLF_PATTERN = Pattern.compile("[\\r\\n]");

    @SuppressWarnings("java:S107")
    @GraphQLField
    @GraphQLName("updateSecurityTxt")
    @GraphQLDescription("Create or update the security.txt settings for a site")
    public static GqlSecurityTxt updateSecurityTxt(
            @GraphQLName("siteKey") @GraphQLNonNull final String siteKey,
            @GraphQLName("contact") final String contact,
            @GraphQLName("expires") final String expires,
            @GraphQLName("acknowledgments") final String acknowledgments,
            @GraphQLName("acknowledgmentsUrl") final String acknowledgmentsUrl,
            @GraphQLName("canonical") final String canonical,
            @GraphQLName("encryption") final String encryption,
            @GraphQLName("encryptionUrl") final String encryptionUrl,
            @GraphQLName("hiring") final String hiring,
            @GraphQLName("hiringUrl") final String hiringUrl,
            @GraphQLName("policy") final String policy,
            @GraphQLName("policyUrl") final String policyUrl,
            @GraphQLName("preferredLanguages") final String preferredLanguages) {
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<GqlSecurityTxt>() {
                @Override
                public GqlSecurityTxt doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    final String sitePath = "/sites/" + siteKey;
                    if (!session.nodeExists(sitePath)) {
                        throw new RepositoryException("Site not found: " + siteKey);
                    }

                    final JCRSessionWrapper callerSession = JCRSessionFactory.getInstance().getCurrentUserSession();
                    if (!callerSession.nodeExists(sitePath) || !callerSession.getNode(sitePath).hasPermission("siteAdminSecurityTxt")) {
                        throw new AccessDeniedException("siteAdminSecurityTxt");
                    }
                    // Validate all user-supplied string fields before touching the repository.
                    validateFields(contact, canonical, acknowledgmentsUrl, encryptionUrl, hiringUrl, policyUrl, preferredLanguages);

                    final JCRNodeWrapper siteNode = session.getNode(sitePath);

                    final JCRNodeWrapper node;
                    if (siteNode.hasNode(SECURITY_TXT)) {
                        node = siteNode.getNode(SECURITY_TXT);
                    } else {
                        node = siteNode.addNode(SECURITY_TXT, SECURITY_TXT_NODE_TYPE);
                    }

                    setStringProp(node, "contact", contact);
                    setStringProp(node, "expires", expires);
                    setRefProp(session, node, "acknowledgments", acknowledgments);
                    setStringProp(node, "acknowledgmentsUrl", acknowledgmentsUrl);
                    setStringProp(node, "canonical", canonical);
                    setRefProp(session, node, "encryption", encryption);
                    setStringProp(node, "encryptionUrl", encryptionUrl);
                    setRefProp(session, node, "hiring", hiring);
                    setStringProp(node, "hiringUrl", hiringUrl);
                    setRefProp(session, node, "policy", policy);
                    setStringProp(node, "policyUrl", policyUrl);
                    setStringProp(node, "preferredLanguages", preferredLanguages);

                    session.save();

                    return new GqlSecurityTxt(siteKey, contact, expires,
                            acknowledgments, acknowledgmentsUrl,
                            canonical,
                            encryption, encryptionUrl,
                            hiring, hiringUrl,
                            policy, policyUrl,
                            preferredLanguages);
                }
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error updating security.txt settings for site {}", siteKey, e);
            return null;
        }
    }

    /**
     * Validates all user-controlled string fields before they are stored in the JCR.
     * <ul>
     *   <li>Rejects any value containing CR or LF (newline injection / response splitting).</li>
     *   <li>Requires {@code contact} to be a {@code mailto:} or {@code https:} URI.</li>
     *   <li>Requires URL fields to be {@code https:} or {@code mailto:} URIs when non-blank.</li>
     * </ul>
     *
     * @throws RepositoryException with a descriptive message when a field is invalid.
     */
    @SuppressWarnings("java:S107")
    private static void validateFields(String contact, String canonical,
                                       String acknowledgmentsUrl, String encryptionUrl,
                                       String hiringUrl, String policyUrl,
                                       String preferredLanguages) throws RepositoryException {
        // --- CR/LF check on every field ---
        rejectCrlf("contact", contact);
        rejectCrlf("canonical", canonical);
        rejectCrlf("acknowledgmentsUrl", acknowledgmentsUrl);
        rejectCrlf("encryptionUrl", encryptionUrl);
        rejectCrlf("hiringUrl", hiringUrl);
        rejectCrlf("policyUrl", policyUrl);
        rejectCrlf("preferredLanguages", preferredLanguages);

        // --- URI scheme validation ---
        if (StringUtils.isNotBlank(contact) && !CONTACT_PATTERN.matcher(contact.trim()).matches()) {
            throw new RepositoryException(
                    "Invalid contact value: must be a mailto: or https: URI");
        }

        validateUrlField("canonical", canonical);
        validateUrlField("acknowledgmentsUrl", acknowledgmentsUrl);
        validateUrlField("encryptionUrl", encryptionUrl);
        validateUrlField("hiringUrl", hiringUrl);
        validateUrlField("policyUrl", policyUrl);
    }

    private static void rejectCrlf(String fieldName, String value) throws RepositoryException {
        if (value != null && CRLF_PATTERN.matcher(value).find()) {
            throw new RepositoryException(
                    "Invalid value for field '" + fieldName + "': CR/LF characters are not allowed");
        }
    }

    private static void validateUrlField(String fieldName, String value) throws RepositoryException {
        if (StringUtils.isNotBlank(value) && !URL_FIELD_PATTERN.matcher(value.trim()).matches()) {
            throw new RepositoryException(
                    "Invalid value for field '" + fieldName + "': must be an https: or mailto: URI");
        }
    }

    private static void setStringProp(JCRNodeWrapper node, String propName, String value)
            throws RepositoryException {
        if (StringUtils.isNotBlank(value)) {
            node.setProperty(propName, value);
        } else if (node.hasProperty(propName)) {
            node.getProperty(propName).remove();
        }
    }

    private static void setRefProp(JCRSessionWrapper session, JCRNodeWrapper node,
                                   String propName, String uuid) throws RepositoryException {
        if (StringUtils.isNotBlank(uuid)) {
            try {
                final JCRNodeWrapper refNode = session.getNodeByIdentifier(uuid);
                node.setProperty(propName, refNode);
            } catch (ItemNotFoundException e) {
                LOGGER.warn("Referenced node not found for property {}: {}", propName, uuid);
                if (node.hasProperty(propName)) {
                    node.getProperty(propName).remove();
                }
            }
        } else if (node.hasProperty(propName)) {
            node.getProperty(propName).remove();
        }
    }
}
