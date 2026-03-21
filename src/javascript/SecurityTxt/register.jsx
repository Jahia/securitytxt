import { registry } from '@jahia/ui-extender';
import SecurityTxtSettings from './index';

/**
 * Wraps SecurityTxtSettings to extract the siteKey from the admin route context.
 * In Jahia 8.2, site-level admin routes receive a `match` prop from React Router
 * containing route parameters, including the site key.
 */
function SecurityTxtSettingsRoute(props) {
    // The siteKey is provided by Jahia admin via match params or context
    const siteKey =
        (props.match && props.match.params && props.match.params.siteKey) ||
        window.contextJsParameters.siteKey;

    if (!siteKey) {
        return <div>No site selected.</div>;
    }

    return <SecurityTxtSettings siteKey={siteKey} />;
}

export function register() {
    registry.add('adminRoute', 'securitytxt', {
        targets: ['administration-sites:10'],
        requiredPermission: 'siteAdminSecurityTxt',
        label: 'securitytxt:label',
        isSelectable: true,
        component: SecurityTxtSettingsRoute
    });
}
