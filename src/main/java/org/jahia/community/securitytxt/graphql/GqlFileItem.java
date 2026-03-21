package org.jahia.community.securitytxt.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("SecurityTxtFileItem")
@GraphQLDescription("Represents a file or page node available in the site")
public class GqlFileItem {

    private final String path;
    private final String uuid;
    private final String name;

    public GqlFileItem(String path, String uuid, String name) {
        this.path = path;
        this.uuid = uuid;
        this.name = name;
    }

    @GraphQLField
    @GraphQLDescription("The JCR path of the node")
    public String getPath() {
        return path;
    }

    @GraphQLField
    @GraphQLDescription("The UUID of the node")
    public String getUuid() {
        return uuid;
    }

    @GraphQLField
    @GraphQLDescription("The display name of the node")
    public String getName() {
        return name;
    }
}
