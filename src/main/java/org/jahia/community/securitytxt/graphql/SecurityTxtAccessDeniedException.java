package org.jahia.community.securitytxt.graphql;

/**
 * Unchecked exception used to surface a denied {@code siteAdminSecurityTxt}
 * permission check as a GraphQL error to the caller.
 */
public class SecurityTxtAccessDeniedException extends RuntimeException {

    public SecurityTxtAccessDeniedException(String message) {
        super(message);
    }
}
