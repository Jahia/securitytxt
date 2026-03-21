import { gql } from '@apollo/client';

export const GET_SECURITY_TXT_SETTINGS = gql`
    query SecurityTxtSettings($siteKey: String!) {
        securityTxtSettings(siteKey: $siteKey) {
            siteKey
            contact
            expires
            acknowledgments
            canonical
            encryption
            hiring
            policy
            preferredLanguages
        }
    }
`;

export const GET_SECURITY_TXT_FILES = gql`
    query SecurityTxtFiles($siteKey: String!, $searchTerm: String) {
        securityTxtFiles(siteKey: $siteKey, searchTerm: $searchTerm) {
            path
            uuid
            name
            displayName
        }
    }
`;

export const GET_SECURITY_TXT_PAGES = gql`
    query SecurityTxtPages($siteKey: String!, $searchTerm: String) {
        securityTxtPages(siteKey: $siteKey, searchTerm: $searchTerm) {
            path
            uuid
            name
            displayName
        }
    }
`;

export const GET_NODE_BY_UUID = gql`
    query GetNodeByUUID($uuid: String!) {
        jcr {
            nodeById(uuid: $uuid) {
                uuid
                path
                displayName
            }
        }
    }
`;

export const UPDATE_SECURITY_TXT = gql`
    mutation UpdateSecurityTxt(
        $siteKey: String!
        $contact: String
        $expires: String
        $acknowledgments: String
        $canonical: String
        $encryption: String
        $hiring: String
        $policy: String
        $preferredLanguages: String
    ) {
        updateSecurityTxt(
            siteKey: $siteKey
            contact: $contact
            expires: $expires
            acknowledgments: $acknowledgments
            canonical: $canonical
            encryption: $encryption
            hiring: $hiring
            policy: $policy
            preferredLanguages: $preferredLanguages
        ) {
            siteKey
            contact
            expires
            acknowledgments
            canonical
            encryption
            hiring
            policy
            preferredLanguages
        }
    }
`;
