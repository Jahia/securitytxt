package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.*;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;
import org.jahia.services.content.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.AccessDeniedException;
import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.query.QueryManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@GraphQLTypeExtension(DXGraphQLProvider.Query.class)
@GraphQLName("SecurityTxtQueries")
@GraphQLDescription("Security.txt management queries")
public class SecurityTxtQueryExtension {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityTxtQueryExtension.class);
    private static final String SECURITY_TXT = "securitytxt";

    private SecurityTxtQueryExtension() {
    }

    @GraphQLField
    @GraphQLName("securityTxtSettings")
    @GraphQLDescription("Get the security.txt settings for a site")
    public static GqlSecurityTxt getSecurityTxtSettings(
            @GraphQLName("siteKey") @GraphQLNonNull final String siteKey) {
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<GqlSecurityTxt>() {
                @Override
                public GqlSecurityTxt doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    String sitePath = "/sites/" + siteKey;
                    if (!session.nodeExists(sitePath)) {
                        return null;
                    }
                    JCRNodeWrapper siteNode = session.getNode(sitePath);
                    if (!siteNode.hasNode(SECURITY_TXT)) {
                        return new GqlSecurityTxt(siteKey, null, null, null, null, null, null, null, null);
                    }
                    JCRNodeWrapper node = siteNode.getNode(SECURITY_TXT);
                    return new GqlSecurityTxt(
                            siteKey,
                            getStringProp(node, "contact"),
                            getStringProp(node, "expires"),
                            getRefPropUUID(node, "acknowledgments"),
                            getStringProp(node, "canonical"),
                            getRefPropUUID(node, "encryption"),
                            getRefPropUUID(node, "hiring"),
                            getRefPropUUID(node, "policy"),
                            getStringProp(node, "preferredLanguages")
                    );
                }
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error getting security.txt settings for site {}", siteKey, e);
            return null;
        }
    }

    @GraphQLField
    @GraphQLName("securityTxtFiles")
    @GraphQLDescription("Get the list of files available in the site (for encryption and signature pickers)")
    public static List<GqlFileItem> getSecurityTxtFiles(
            @GraphQLName("siteKey") @GraphQLNonNull final String siteKey,
            @GraphQLName("searchTerm") final String searchTerm) {
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<List<GqlFileItem>>() {
                @Override
                public List<GqlFileItem> doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    return getSiteItems(session, siteKey, "files", "jnt:file", searchTerm);
                }
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error getting files for site {}", siteKey, e);
            return Collections.emptyList();
        }
    }

    @GraphQLField
    @GraphQLName("securityTxtPages")
    @GraphQLDescription("Get the list of pages available in the site (for acknowledgements, policy, hiring pickers)")
    public static List<GqlFileItem> getSecurityTxtPages(
            @GraphQLName("siteKey") @GraphQLNonNull final String siteKey,
            @GraphQLName("searchTerm") final String searchTerm) {
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<List<GqlFileItem>>() {
                @Override
                public List<GqlFileItem> doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    return getSiteItems(session, siteKey, "home", "jnt:page", searchTerm);
                }
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error getting pages for site {}", siteKey, e);
            return Collections.emptyList();
        }
    }

    private static List<GqlFileItem> getSiteItems(JCRSessionWrapper session, String siteKey,
                                                  String relPath, String nodeType, String searchTerm) throws RepositoryException {
        final List<GqlFileItem> items = new ArrayList<>();
        final String sitePath = "/sites/" + siteKey;
        if (!session.nodeExists(sitePath)) {
            throw new RepositoryException("Site not found: " + siteKey);
        }
        final JCRNodeWrapper siteNode = session.getNode(sitePath);
        if (!siteNode.hasPermission("siteAdminSecurityTxt")) {
            throw new AccessDeniedException("siteAdminSecurityTxt");
        }

        final JCRNodeWrapper rootNode;
        try {
            rootNode = siteNode.getNode(relPath);
            items.add(new GqlFileItem(rootNode.getPath(), rootNode.getIdentifier(), rootNode.getName(), rootNode.getDisplayableName()));
            final StringBuilder filter = new StringBuilder("isdescendantnode(f,['")
                    .append(JCRContentUtils.sqlEncode(rootNode.getPath()))
                    .append("'])");
            for (JCRStoreProvider provider : JCRStoreService.getInstance().getSessionFactory().getProviderList()) {
                if (!provider.isDefault() && provider.getMountPoint().startsWith(rootNode.getPath())) {
                    filter.append(" and (not isdescendantnode(f,['")
                            .append(JCRContentUtils.sqlEncode(provider.getMountPoint()))
                            .append("']))");
                }
            }

            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                filter.append(" and localname(f) like '%")
                        .append(searchTerm.trim().replace("'", "''"))
                        .append("%'");
            }

            final QueryManager qm = session.getWorkspace().getQueryManager();
            final javax.jcr.query.Query q = qm.createQuery(
                    "select * from [" + nodeType + "] as f where " + filter,
                    javax.jcr.query.Query.JCR_SQL2);
            final NodeIterator nodes = q.execute().getNodes();
            while (nodes.hasNext()) {
                final JCRNodeWrapper node = (JCRNodeWrapper) nodes.nextNode();
                items.add(new GqlFileItem(node.getPath(), node.getIdentifier(), node.getName(), node.getDisplayableName()));
            }
        } catch (RepositoryException e) {
            // No root node, return empty list
            return items;
        }

        return items;
    }

    private static String getStringProp(JCRNodeWrapper node, String propName) throws RepositoryException {
        if (node.hasProperty(propName)) {
            return node.getPropertyAsString(propName);
        }
        return null;
    }

    private static String getRefPropUUID(JCRNodeWrapper node, String propName) throws RepositoryException {
        if (node.hasProperty(propName)) {
            try {
                return node.getProperty(propName).getNode().getIdentifier();
            } catch (RepositoryException e) {
                // Referenced node no longer exists
                return null;
            }
        }
        return null;
    }
}
