package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.*;
import org.apache.commons.lang.StringUtils;
import org.jahia.community.securitytxt.SecurityTxtFieldValidator;
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

@GraphQLName("SecurityTxtMutation")
@GraphQLDescription("security.txt mutations")
public class SecurityTxtMutation {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityTxtMutation.class);
    private static final String SECURITY_TXT = "securitytxt";
    private static final String SECURITY_TXT_NODE_TYPE = "jnt:securitytxt";
    private static final String FIELD_ACKNOWLEDGMENTS_URL = "acknowledgmentsUrl";
    private static final String FIELD_CANONICAL = "canonical";
    private static final String FIELD_ENCRYPTION_URL = "encryptionUrl";
    private static final String FIELD_HIRING_URL = "hiringUrl";
    private static final String FIELD_POLICY_URL = "policyUrl";

    @SuppressWarnings("java:S107")
    @GraphQLField
    @GraphQLName("update")
    @GraphQLDescription("Create or update the security.txt settings for a site")
    public GqlSecurityTxt updateSecurityTxt(
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
                    setStringProp(node, FIELD_ACKNOWLEDGMENTS_URL, acknowledgmentsUrl);
                    setStringProp(node, FIELD_CANONICAL, canonical);
                    setRefProp(session, node, "encryption", encryption);
                    setStringProp(node, FIELD_ENCRYPTION_URL, encryptionUrl);
                    setRefProp(session, node, "hiring", hiring);
                    setStringProp(node, FIELD_HIRING_URL, hiringUrl);
                    setRefProp(session, node, "policy", policy);
                    setStringProp(node, FIELD_POLICY_URL, policyUrl);
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
        try {
            // --- CR/LF check on every field ---
            SecurityTxtFieldValidator.requireFreeOfCrlf("contact", contact);
            SecurityTxtFieldValidator.requireFreeOfCrlf(FIELD_CANONICAL, canonical);
            SecurityTxtFieldValidator.requireFreeOfCrlf(FIELD_ACKNOWLEDGMENTS_URL, acknowledgmentsUrl);
            SecurityTxtFieldValidator.requireFreeOfCrlf(FIELD_ENCRYPTION_URL, encryptionUrl);
            SecurityTxtFieldValidator.requireFreeOfCrlf(FIELD_HIRING_URL, hiringUrl);
            SecurityTxtFieldValidator.requireFreeOfCrlf(FIELD_POLICY_URL, policyUrl);
            SecurityTxtFieldValidator.requireFreeOfCrlf("preferredLanguages", preferredLanguages);

            // --- URI scheme validation ---
            SecurityTxtFieldValidator.requireValidContact(contact);
            SecurityTxtFieldValidator.requireValidUrlField(FIELD_CANONICAL, canonical);
            SecurityTxtFieldValidator.requireValidUrlField(FIELD_ACKNOWLEDGMENTS_URL, acknowledgmentsUrl);
            SecurityTxtFieldValidator.requireValidUrlField(FIELD_ENCRYPTION_URL, encryptionUrl);
            SecurityTxtFieldValidator.requireValidUrlField(FIELD_HIRING_URL, hiringUrl);
            SecurityTxtFieldValidator.requireValidUrlField(FIELD_POLICY_URL, policyUrl);
        } catch (IllegalArgumentException e) {
            // Preserve the existing failure path: invalid input aborts the mutation.
            throw new RepositoryException(e.getMessage(), e);
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
