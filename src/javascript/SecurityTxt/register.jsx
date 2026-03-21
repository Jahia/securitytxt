import {registry} from '@jahia/ui-extender';
import SecurityTxtSettings from "./SecurityTxtSettings";
import React from "react";

function SecurityTxtSettingsRoute(props) {
    // The siteKey is provided by Jahia admin via match params or context
    console.debug('%c security.txt: determining site key', 'color: #463CBA');
    const siteKey =
        (props.match && props.match.params && props.match.params.siteKey) ||
        window.contextJsParameters.siteKey;

    if (!siteKey) {
        console.debug('%c security.txt: no site key', 'color: #463CBA');
        return <div>No site selected.</div>;
    }
    console.debug('%c security.txt: site key %s', 'color: #463CBA', siteKey);
    return <SecurityTxtSettings siteKey={siteKey} />;
}

export default () => {
    console.debug('%c security.txt: activation in progress', 'color: #463CBA');
    registry.add('adminRoute', 'securitytxt', {
        icon: window.jahia.moonstone.toIconComponent('FileText'),
        targets: ['administration-sites:999'],
        requiredPermission: 'siteAdminSecurityTxt',
        label: 'securitytxt:label',
        isSelectable: true,
        render: () => React.createElement(SecurityTxtSettingsRoute)
    });
}
