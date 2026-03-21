package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.apache.commons.lang.StringUtils;
import org.jahia.services.content.JCRCallback;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;

@GraphQLTypeExtension(DXGraphQLProvider.Mutation.class)
@GraphQLName("SecurityTxtMutations")
@GraphQLDescription("Security.txt management mutations")
public class SecurityTxtMutationExtension {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityTxtMutationExtension.class);
    private static final String SECURITY_TXT = "securitytxt";
    private static final String SECURITY_TXT_NODE_TYPE = "jnt:securitytxt";

    @GraphQLField
    @GraphQLName("updateSecurityTxt")
    @GraphQLDescription("Create or update the security.txt settings for a site")
    public static GqlSecurityTxt updateSecurityTxt(
            @GraphQLName("siteKey") @GraphQLNonNull final String siteKey,
            @GraphQLName("contact") final String contact,
            @GraphQLName("expires") final String expires,
            @GraphQLName("acknowledgments") final String acknowledgments,
            @GraphQLName("canonical") final String canonical,
            @GraphQLName("encryption") final String encryption,
            @GraphQLName("hiring") final String hiring,
            @GraphQLName("policy") final String policy,
            @GraphQLName("preferredLanguages") final String preferredLanguages) {
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<GqlSecurityTxt>() {
                @Override
                public GqlSecurityTxt doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    final String sitePath = "/sites/" + siteKey;
                    if (!session.nodeExists(sitePath)) {
                        throw new RepositoryException("Site not found: " + siteKey);
                    }

                    final JCRNodeWrapper siteNode = session.getNode(sitePath);
                    if (!siteNode.hasPermission("siteAdminSecurityTxt")) {
                        throw new AccessDeniedException("siteAdminSecurityTxt");
                    }

                    final JCRNodeWrapper node;
                    if (siteNode.hasNode(SECURITY_TXT)) {
                        node = siteNode.getNode(SECURITY_TXT);
                    } else {
                        node = siteNode.addNode(SECURITY_TXT, SECURITY_TXT_NODE_TYPE);
                    }

                    setStringProp(node, "contact", contact);
                    setStringProp(node, "expires", expires);
                    setRefProp(session, node, "acknowledgments", acknowledgments);
                    setStringProp(node, "canonical", canonical);
                    setRefProp(session, node, "encryption", encryption);
                    setRefProp(session, node, "hiring", hiring);
                    setRefProp(session, node, "policy", policy);
                    setStringProp(node, "preferredLanguages", preferredLanguages);

                    session.save();

                    return new GqlSecurityTxt(siteKey, contact, expires, acknowledgments,
                            canonical, encryption, hiring, policy, preferredLanguages);
                }
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error updating security.txt settings for site {}", siteKey, e);
            return null;
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
