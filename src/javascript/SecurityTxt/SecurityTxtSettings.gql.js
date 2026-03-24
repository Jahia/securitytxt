import {gql} from '@apollo/client';

export const GET_SECURITY_TXT_SETTINGS = gql`
    query SecurityTxtSettings($siteKey: String!) {
        securityTxtSettings(siteKey: $siteKey) {
            siteKey
            contact
            expires
            acknowledgments
            acknowledgmentsUrl
            canonical
            encryption
            encryptionUrl
            hiring
            hiringUrl
            policy
            policyUrl
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
        $acknowledgmentsUrl: String
        $canonical: String
        $encryption: String
        $encryptionUrl: String
        $hiring: String
        $hiringUrl: String
        $policy: String
        $policyUrl: String
        $preferredLanguages: String
    ) {
        updateSecurityTxt(
            siteKey: $siteKey
            contact: $contact
            expires: $expires
            acknowledgments: $acknowledgments
            acknowledgmentsUrl: $acknowledgmentsUrl
            canonical: $canonical
            encryption: $encryption
            encryptionUrl: $encryptionUrl
            hiring: $hiring
            hiringUrl: $hiringUrl
            policy: $policy
            policyUrl: $policyUrl
            preferredLanguages: $preferredLanguages
        ) {
            siteKey
            contact
            expires
            acknowledgments
            acknowledgmentsUrl
            canonical
            encryption
            encryptionUrl
            hiring
            hiringUrl
            policy
            policyUrl
            preferredLanguages
        }
    }
`;
