package org.jahia.community.securitytxt.graphql;

import org.jahia.modules.graphql.provider.dxm.DXGraphQLExtensionsProvider;

import java.util.Arrays;
import java.util.Collection;

/**
 * Registers the security.txt GraphQL query and mutation extensions with Jahia's
 * graphql-dxm-provider. This bean is declared in META-INF/spring/securitytxt.xml
 * and exported as an OSGi service so the DX GraphQL provider discovers it.
 */
public class SecurityTxtGraphQLExtensionsProvider implements DXGraphQLExtensionsProvider {

    @Override
    public Collection<Class<?>> getExtensions() {
        return Arrays.asList(
                SecurityTxtQueryExtensions.class,
                SecurityTxtMutationExtensions.class
        );
    }
}
