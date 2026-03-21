import { gql } from '@apollo/client';

export const GET_SECURITY_TXT_SETTINGS = gql`
    query SecurityTxtSettings($siteKey: String!) {
        securityTxtSettings(siteKey: $siteKey) {
            siteKey
            contact
            encryption
            acknowledgements
            policy
            signature
            hiring
        }
    }
`;

export const GET_SECURITY_TXT_FILES = gql`
    query SecurityTxtFiles($siteKey: String!) {
        securityTxtFiles(siteKey: $siteKey) {
            path
            uuid
            name
        }
    }
`;

export const GET_SECURITY_TXT_PAGES = gql`
    query SecurityTxtPages($siteKey: String!) {
        securityTxtPages(siteKey: $siteKey) {
            path
            uuid
            name
        }
    }
`;

export const UPDATE_SECURITY_TXT = gql`
    mutation UpdateSecurityTxt(
        $siteKey: String!
        $contact: String
        $encryption: String
        $acknowledgements: String
        $policy: String
        $signature: String
        $hiring: String
    ) {
        updateSecurityTxt(
            siteKey: $siteKey
            contact: $contact
            encryption: $encryption
            acknowledgements: $acknowledgements
            policy: $policy
            signature: $signature
            hiring: $hiring
        ) {
            siteKey
            contact
            encryption
            acknowledgements
            policy
            signature
            hiring
        }
    }
`;
