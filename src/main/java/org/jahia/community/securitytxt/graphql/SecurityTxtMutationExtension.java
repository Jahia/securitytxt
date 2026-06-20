package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.*;
import org.jahia.modules.graphql.provider.dxm.DXGraphQLProvider;

@GraphQLTypeExtension(DXGraphQLProvider.Mutation.class)
@GraphQLDescription("security.txt mutations")
public class SecurityTxtMutationExtension {

    private SecurityTxtMutationExtension() {
    }

    @GraphQLField
    @GraphQLName("securityTxt")
    @GraphQLDescription("security.txt mutation namespace")
    public static SecurityTxtMutation securityTxt() {
        return new SecurityTxtMutation();
    }
}
