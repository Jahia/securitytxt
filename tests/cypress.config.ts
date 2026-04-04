import {defineConfig} from "cypress";

export default defineConfig({
    allowCypressEnv: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 7000,
    videoUploadOnPasses: false,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json',
    },
    screenshotsFolder: './results/screenshots',
    videosFolder: './results/videos',
    viewportWidth: 1366,
    viewportHeight: 768,
    watchForFileChanges: false,
    experimentalModifyObstructiveThirdPartyCode: true, // Required for SSO/social authentication
    experimentalSessionAndOrigin: true, // Enable better session and origin handling for cross-origin tests
    includeShadowDom: true, // Enable automatic shadow DOM traversal (including closed shadow roots)
    e2e: {
        setupNodeEvents(on, config) {
            return require('./cypress/plugins/index.js')(on, config)
        },
        baseUrl: 'http://jahia:8080',
    },
});
