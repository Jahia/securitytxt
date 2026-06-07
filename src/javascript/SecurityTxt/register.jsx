import {registry} from '@jahia/ui-extender';
import SecurityTxtSettings from "./SecurityTxtSettings";
import React from "react";

function SecurityTxtSettingsRoute(props) {
    // The siteKey is provided by Jahia admin via match params or context
    const siteKey =
        (props.match && props.match.params && props.match.params.siteKey) ||
        window.contextJsParameters.siteKey;

    if (!siteKey) {
        return <div>No site selected.</div>;
    }

    return <SecurityTxtSettings siteKey={siteKey}/>;
}

export default () => {
    registry.add('adminRoute', 'securitytxt', {
        icon: window.jahia.moonstone.toIconComponent('FileText'),
        targets: ['administration-sites:999'],
        requiredPermission: 'siteAdminSecurityTxt',
        label: 'securitytxt:label.menu_entry',
        isSelectable: true,
        render: () => React.createElement(SecurityTxtSettingsRoute)
    });
}
