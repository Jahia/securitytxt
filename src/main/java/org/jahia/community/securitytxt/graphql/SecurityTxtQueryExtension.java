package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.*;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;

@GraphQLTypeExtension(DXGraphQLProvider.Query.class)
@GraphQLDescription("security.txt queries")
public class SecurityTxtQueryExtension {

    private SecurityTxtQueryExtension() {
    }

    @GraphQLField
    @GraphQLName("securityTxt")
    @GraphQLDescription("security.txt query namespace")
    public static SecurityTxtQuery securityTxt() {
        return new SecurityTxtQuery();
    }
}
