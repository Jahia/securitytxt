import {registry} from '@jahia/ui-extender';
import register from './SecurityTxt/register';
import i18next from 'i18next';

export default function () {
    registry.add('callback', 'securitytxt', {
        targets: ['jahiaApp-init:50'],
        callback: async() => {
            await i18next.loadNamespaces('securitytxt');
            register();
            console.debug('%c security.txt is activated', 'color: #3c8cba');
        }
    });
}


