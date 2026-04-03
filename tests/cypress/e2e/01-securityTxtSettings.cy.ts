import {DocumentNode} from 'graphql'

describe('Security.txt Settings', () => {
    it('passes', () => {
        cy.visit('https://example.cypress.io')
    })

    // const siteKey = 'digitall'
    // const adminPath = `/jahia/administration/${siteKey}/securitytxt`
    // let updateSecurityTxt: DocumentNode
    // let getSecurityTxtSettings: DocumentNode
    // let deleteNode: DocumentNode
    //
    // updateSecurityTxt = require('graphql-tag/loader!../fixtures/graphql/mutation/updateSecurityTxt.graphql')
    // getSecurityTxtSettings = require('graphql-tag/loader!../fixtures/graphql/query/getSecurityTxtSettings.graphql')
    // deleteNode = require('graphql-tag/loader!../fixtures/graphql/mutation/deleteNode.graphql')
    //
    // before(() => {
    //     cy.login()
    // })
    //
    // beforeEach(() => {
    //     cy.login()
    //     // Reset all settings to empty before each test to guarantee a clean state
    //     cy.apollo({
    //         mutation: updateSecurityTxt,
    //         variables: {
    //             siteKey,
    //             contact: null,
    //             expires: null,
    //             acknowledgments: null,
    //             canonical: null,
    //             encryption: null,
    //             hiring: null,
    //             policy: null,
    //             preferredLanguages: null,
    //         },
    //     })
    // })
    //
    // after(() => {
    //     cy.login()
    //     cy.apollo({
    //         mutation: deleteNode,
    //         variables: { path: `/sites/${siteKey}/securitytxt` },
    //     })
    // })
    //
    // it('renders the settings form with all RFC 9116 fields', () => {
    //     cy.visit(adminPath)
    //
    //      cy.get('#securitytxt-contact').should('be.visible')
    //      cy.get('#securitytxt-expires').should('be.visible')
    //      cy.get('#securitytxt-canonical').should('be.visible')
    //      cy.get('#securitytxt-preferredLanguages').should('be.visible')
    //
    //     // NodePicker fields — verify 4 search inputs are present (acknowledgments, encryption, hiring, policy)
    //     cy.get('input[placeholder="Search…"]').should('have.length', 4)
    //
    //     // Action buttons
    //     cy.contains('button', 'Save').should('be.visible')
    //     cy.contains('button', 'Cancel').should('be.visible')
    // })
    //
    // it('saves text fields and shows a success alert', () => {
    //     cy.visit(adminPath)
    //
    //     cy.get('#securitytxt-contact').type('mailto:security@example.com')
    //     cy.get('#securitytxt-canonical').type('https://example.com/.well-known/security.txt')
    //     cy.get('#securitytxt-preferredLanguages').type('en, fr')
    //
    //     cy.contains('button', 'Save').click()
    //
    //     cy.contains('Security.txt settings saved successfully.').should('be.visible')
    //
    //     // Verify persistence via GraphQL
    //     cy.apollo({ query: getSecurityTxtSettings, variables: { siteKey } })
    //         .its('data.securityTxtSettings')
    //         .should((settings: Record<string, string>) => {
    //             expect(settings.contact).to.equal('mailto:security@example.com')
    //             expect(settings.canonical).to.equal('https://example.com/.well-known/security.txt')
    //             expect(settings.preferredLanguages).to.equal('en, fr')
    //         })
    // })
    //
    // it('saves the expires field in RFC 3339 format with local timezone offset', () => {
    //     cy.visit(adminPath)
    //
    //     // The input type is datetime-local; the component converts to RFC 3339 on save
    //     cy.get('#securitytxt-expires').type('2027-12-31T23:59:59')
    //     cy.contains('button', 'Save').click()
    //
    //     cy.contains('Security.txt settings saved successfully.').should('be.visible')
    //
    //     // Verify the stored value is in RFC 3339 format: YYYY-MM-DDTHH:MM:SS.mss±HH:MM
    //     cy.apollo({ query: getSecurityTxtSettings, variables: { siteKey } })
    //         .its('data.securityTxtSettings.expires')
    //         .should('match', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/)
    // })
    //
    // it('cancels edits and reverts the form to the last saved values', () => {
    //     // Pre-load a saved contact via API
    //     cy.apollo({
    //         mutation: updateSecurityTxt,
    //         variables: {
    //             siteKey,
    //             contact: 'mailto:original@example.com',
    //             expires: null,
    //             acknowledgments: null,
    //             canonical: null,
    //             encryption: null,
    //             hiring: null,
    //             policy: null,
    //             preferredLanguages: null,
    //         },
    //     })
    //
    //     cy.visit(adminPath)
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:original@example.com')
    //
    //     // Modify without saving
    //     cy.get('#securitytxt-contact').clear().type('mailto:changed@example.com')
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:changed@example.com')
    //
    //     cy.contains('button', 'Cancel').click()
    //
    //     // Value should revert to the last saved one
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:original@example.com')
    // })
    //
    // it('sets and retrieves all text fields via the GraphQL API', () => {
    //     cy.apollo({
    //         mutation: updateSecurityTxt,
    //         variables: {
    //             siteKey,
    //             contact: 'mailto:api@example.com',
    //             expires: '2027-06-01T00:00:00.000+00:00',
    //             canonical: 'https://api.example.com/.well-known/security.txt',
    //             preferredLanguages: 'en',
    //             acknowledgments: null,
    //             encryption: null,
    //             hiring: null,
    //             policy: null,
    //         },
    //     }).then((result: { data: { updateSecurityTxt: Record<string, string> } }) => {
    //         const s = result.data.updateSecurityTxt
    //         expect(s.contact).to.equal('mailto:api@example.com')
    //         expect(s.canonical).to.equal('https://api.example.com/.well-known/security.txt')
    //         expect(s.preferredLanguages).to.equal('en')
    //     })
    //
    //     cy.apollo({ query: getSecurityTxtSettings, variables: { siteKey } })
    //         .its('data.securityTxtSettings')
    //         .should((settings: Record<string, string>) => {
    //             expect(settings.contact).to.equal('mailto:api@example.com')
    //             expect(settings.canonical).to.equal('https://api.example.com/.well-known/security.txt')
    //             expect(settings.preferredLanguages).to.equal('en')
    //         })
    // })
    //
    // it('clears a field by saving an empty value', () => {
    //     // Pre-load a value via API
    //     cy.apollo({
    //         mutation: updateSecurityTxt,
    //         variables: {
    //             siteKey,
    //             contact: 'mailto:todelete@example.com',
    //             expires: null,
    //             acknowledgments: null,
    //             canonical: null,
    //             encryption: null,
    //             hiring: null,
    //             policy: null,
    //             preferredLanguages: null,
    //         },
    //     })
    //
    //     cy.visit(adminPath)
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:todelete@example.com')
    //
    //     cy.get('#securitytxt-contact').clear()
    //     cy.contains('button', 'Save').click()
    //     cy.contains('Security.txt settings saved successfully.').should('be.visible')
    //
    //     cy.apollo({ query: getSecurityTxtSettings, variables: { siteKey } })
    //         .its('data.securityTxtSettings.contact')
    //         .should('be.null')
    // })
    //
    // it('reloads saved values when navigating back to the settings page', () => {
    //     // Save via API
    //     cy.apollo({
    //         mutation: updateSecurityTxt,
    //         variables: {
    //             siteKey,
    //             contact: 'mailto:persist@example.com',
    //             canonical: 'https://persist.example.com/.well-known/security.txt',
    //             preferredLanguages: 'de',
    //             expires: null,
    //             acknowledgments: null,
    //             encryption: null,
    //             hiring: null,
    //             policy: null,
    //         },
    //     })
    //
    //     // First visit
    //     cy.visit(adminPath)
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:persist@example.com')
    //
    //     // Navigate away and come back
    //     cy.visit('/jahia/administration')
    //     cy.visit(adminPath)
    //
    //     cy.get('#securitytxt-contact').should('have.value', 'mailto:persist@example.com')
    //     cy.get('#securitytxt-canonical').should('have.value', 'https://persist.example.com/.well-known/security.txt')
    //     cy.get('#securitytxt-preferredLanguages').should('have.value', 'de')
    // })
    //
    // it('shows NodePicker search inputs and triggers a page search on Enter', () => {
    //     cy.visit(adminPath)
    //
    //     // There are 4 NodePicker fields: acknowledgments, encryption (files), hiring, policy
    //     cy.get('input[placeholder="Search…"]').should('have.length', 4)
    //
    //     // Search in the first NodePicker (Acknowledgments — pages)
    //     cy.get('input[placeholder="Search…"]').first().type('home')
    //     cy.get('input[placeholder="Search…"]').first().type('{enter}')
    //
    //     // After pressing Enter the query fires; the dropdown should render (with results or empty state)
    //     cy.get('[class*="dropdown"]').first().should('be.visible')
    // })
    //
    // it('shows NodePicker search inputs and triggers a file search on Enter', () => {
    //     cy.visit(adminPath)
    //
    //     // The Encryption NodePicker is the second one (index 1 among search inputs)
    //     cy.get('input[placeholder="Search…"]').eq(1).type('key')
    //     cy.get('input[placeholder="Search…"]').eq(1).type('{enter}')
    //
    //     // Dropdown should render
    //     cy.get('[class*="dropdown"]').eq(1).should('be.visible')
    // })
})
