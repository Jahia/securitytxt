import {registry} from '@jahia/ui-extender';
import register from './SecurityTxt/register';
import i18next from 'i18next';

window.jahia.localeFiles = window.jahia.localeFiles || {};
window.jahia.localeFiles['securitytxt'] = hashes;

export default function () {
    registry.add('callback', 'securitytxt', {
        targets: ['jahiaApp-init:50'],
        callback: async () => {
            await i18next.loadNamespaces('securitytxt', () => {
                console.debug('%c security.txt: i18n namespace loaded', 'color: #463CBA');
            });
            register();
            console.debug('%c security.txt: activation completed', 'color: #463CBA');
        }
    });
}


