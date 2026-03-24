import React, {useEffect, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {Button, Field, Input, Typography} from '@jahia/moonstone';
import styles from './SecurityTxtSettings.scss';
import {
    GET_SECURITY_TXT_FILES,
    GET_SECURITY_TXT_PAGES,
    GET_SECURITY_TXT_SETTINGS,
    UPDATE_SECURITY_TXT
} from './SecurityTxtSettings.gql';
import {NodePicker} from './components/NodePicker';

const toDatetimeLocal = rfc3339 => {
    if (!rfc3339) {
        return '';
    }

    const date = new Date(rfc3339);
    if (isNaN(date.getTime())) {
        return '';
    }

    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const toRfc3339 = datetimeLocal => {
    if (!datetimeLocal) {
        return '';
    }

    const date = new Date(datetimeLocal);
    const pad = n => String(n).padStart(2, '0');
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const offsetStr = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${ms}${offsetStr}`;
};

export function SecurityTxtSettings({siteKey}) {
    const {t} = useTranslation('securitytxt');

    const [contact, setContact] = useState('');
    const [expires, setExpires] = useState('');
    const [acknowledgments, setAcknowledgments] = useState(null);
    const [acknowledgmentsUrl, setAcknowledgmentsUrl] = useState('');
    const [acknowledgmentsMode, setAcknowledgmentsMode] = useState('node');
    const [canonical, setCanonical] = useState('');
    const [encryption, setEncryption] = useState(null);
    const [encryptionUrl, setEncryptionUrl] = useState('');
    const [encryptionMode, setEncryptionMode] = useState('node');
    const [hiring, setHiring] = useState(null);
    const [hiringUrl, setHiringUrl] = useState('');
    const [hiringMode, setHiringMode] = useState('node');
    const [policy, setPolicy] = useState(null);
    const [policyUrl, setPolicyUrl] = useState('');
    const [policyMode, setPolicyMode] = useState('node');
    const [preferredLanguages, setPreferredLanguages] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
    const [visibleFields, setVisibleFields] = useState(new Set());

    const OPTIONAL_FIELDS = [
        {key: 'acknowledgments', labelKey: 'label.acknowledgments'},
        {key: 'canonical', labelKey: 'label.canonical'},
        {key: 'encryption', labelKey: 'label.encryption'},
        {key: 'hiring', labelKey: 'label.hiring'},
        {key: 'policy', labelKey: 'label.policy'},
        {key: 'preferredLanguages', labelKey: 'label.preferredLanguages'}
    ];

    console.debug('%c security.txt: retrieving settings for %s', 'color: #463CBA', siteKey);
    const {data: settingsData, loading: settingsLoading, error: settingsError} = useQuery(
        GET_SECURITY_TXT_SETTINGS,
        {variables: {siteKey}, fetchPolicy: 'network-only'}
    );

    const [updateSecurityTxt, {loading: saving}] = useMutation(UPDATE_SECURITY_TXT, {
        refetchQueries: [{query: GET_SECURITY_TXT_SETTINGS, variables: {siteKey}}]
    });

    const syncFromSettings = s => {
        setContact(s.contact || '');
        setExpires(toDatetimeLocal(s.expires));
        setAcknowledgments(s.acknowledgments || null);
        setAcknowledgmentsUrl(s.acknowledgmentsUrl || '');
        setAcknowledgmentsMode(s.acknowledgmentsUrl ? 'url' : 'node');
        setCanonical(s.canonical || '');
        setEncryption(s.encryption || null);
        setEncryptionUrl(s.encryptionUrl || '');
        setEncryptionMode(s.encryptionUrl ? 'url' : 'node');
        setHiring(s.hiring || null);
        setHiringUrl(s.hiringUrl || '');
        setHiringMode(s.hiringUrl ? 'url' : 'node');
        setPolicy(s.policy || null);
        setPolicyUrl(s.policyUrl || '');
        setPolicyMode(s.policyUrl ? 'url' : 'node');
        setPreferredLanguages(s.preferredLanguages || '');
        const visible = new Set();
        if (s.acknowledgments || s.acknowledgmentsUrl) {
            visible.add('acknowledgments');
        }

        if (s.canonical) {
            visible.add('canonical');
        }

        if (s.encryption || s.encryptionUrl) {
            visible.add('encryption');
        }

        if (s.hiring || s.hiringUrl) {
            visible.add('hiring');
        }

        if (s.policy || s.policyUrl) {
            visible.add('policy');
        }

        if (s.preferredLanguages) {
            visible.add('preferredLanguages');
        }

        setVisibleFields(visible);
    };

    useEffect(() => {
        if (settingsData && settingsData.securityTxtSettings) {
            syncFromSettings(settingsData.securityTxtSettings);
        }
    }, [settingsData]);

    const handleSubmit = async () => {
        setSaveStatus(null);
        try {
            const result = await updateSecurityTxt({
                variables: {
                    siteKey,
                    contact: contact || null,
                    expires: toRfc3339(expires) || null,
                    acknowledgments: acknowledgmentsMode === 'node' ? acknowledgments : null,
                    acknowledgmentsUrl: acknowledgmentsMode === 'url' ? (acknowledgmentsUrl || null) : null,
                    canonical: canonical || null,
                    encryption: encryptionMode === 'node' ? encryption : null,
                    encryptionUrl: encryptionMode === 'url' ? (encryptionUrl || null) : null,
                    hiring: hiringMode === 'node' ? hiring : null,
                    hiringUrl: hiringMode === 'url' ? (hiringUrl || null) : null,
                    policy: policyMode === 'node' ? policy : null,
                    policyUrl: policyMode === 'url' ? (policyUrl || null) : null,
                    preferredLanguages: preferredLanguages || null
                }
            });
            if (result.data && result.data.updateSecurityTxt) {
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error('Failed to update security.txt settings:', err);
            setSaveStatus('error');
        }
    };

    const handleCancel = () => {
        if (settingsData && settingsData.securityTxtSettings) {
            syncFromSettings(settingsData.securityTxtSettings);
        }
        setSaveStatus(null);
    };

    if (settingsLoading) {
        return <div className={styles.securitytxt_loading}>{t('label.loading')}</div>;
    }

    if (settingsError) {
        return (
            <div className={styles.securitytxt_error}>
                {t('securitytxt.errors.load.failed')}: {settingsError.message}
            </div>
        );
    }

    return (
        <div>
            <div className={styles.securitytxt_page_header}>
                <h2>Security.txt - {siteKey}</h2>
            </div>
            <div className={styles.securitytxt_container}>
                <div className={styles.securitytxt_intro}>
                    <p>
                        {t('securitytxt.description')}{' '}
                        <a href="https://securitytxt.org/" target="_blank" rel="noreferrer">
                            security.txt
                        </a>
                    </p>
                    <p>
                        {t('securitytxt.signature.hint')}:{' '}
                        <code>gpg --output security.txt.sig --detach-sig security.txt</code>
                    </p>
                </div>

                {saveStatus === 'success' && (
                    <div className={`${styles.securitytxt_alert} ${styles['securitytxt_alert--success']}`}>
                        {t('securitytxt.success.update')}
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className={`${styles.securitytxt_alert} ${styles['securitytxt_alert--error']}`}>
                        {t('securitytxt.errors.update.failed')}
                    </div>
                )}

                <div className={styles.securitytxt_form}>
                    <Field label={t('label.contact')} id="securitytxt-contact">
                        <Input
                            id="securitytxt-contact"
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                            placeholder="mailto:security@example.com"
                        />
                    </Field>

                    <Field label={t('label.expires')} id="securitytxt-expires">
                        <input
                            id="securitytxt-expires"
                            type="datetime-local"
                            className={styles.securitytxt_datetime_input}
                            value={expires}
                            onChange={e => setExpires(e.target.value)}
                        />
                    </Field>

                    {visibleFields.has('acknowledgments') && (
                        <div>
                            <div className={styles.securitytxt_mode_toggle}>
                                <Button
                                    label={t('label.mode.internal')}
                                    variant={acknowledgmentsMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setAcknowledgmentsMode('node')}
                                />
                                <Button
                                    label={t('label.mode.external')}
                                    variant={acknowledgmentsMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setAcknowledgmentsMode('url')}
                                />
                            </div>
                            {acknowledgmentsMode === 'node' ? (
                                <NodePicker
                                    label={t('label.acknowledgments')}
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="securityTxtPages"
                                    value={acknowledgments}
                                    onChange={setAcknowledgments}
                                />
                            ) : (
                                <Field label={t('label.acknowledgments')} id="securitytxt-acknowledgmentsUrl">
                                    <Input
                                        id="securitytxt-acknowledgmentsUrl"
                                        value={acknowledgmentsUrl}
                                        onChange={e => setAcknowledgmentsUrl(e.target.value)}
                                        placeholder="https://example.com/security/acknowledgments"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('canonical') && (
                        <Field label={t('label.canonical')} id="securitytxt-canonical">
                            <Input
                                id="securitytxt-canonical"
                                value={canonical}
                                onChange={e => setCanonical(e.target.value)}
                                placeholder="https://example.com/.well-known/security.txt"
                            />
                        </Field>
                    )}

                    {visibleFields.has('encryption') && (
                        <div>
                            <div className={styles.securitytxt_mode_toggle}>
                                <Button
                                    label={t('label.mode.internal')}
                                    variant={encryptionMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setEncryptionMode('node')}
                                />
                                <Button
                                    label={t('label.mode.external')}
                                    variant={encryptionMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setEncryptionMode('url')}
                                />
                            </div>
                            {encryptionMode === 'node' ? (
                                <NodePicker
                                    label={t('label.encryption')}
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_FILES}
                                    resultKey="securityTxtFiles"
                                    value={encryption}
                                    onChange={setEncryption}
                                />
                            ) : (
                                <Field label={t('label.encryption')} id="securitytxt-encryptionUrl">
                                    <Input
                                        id="securitytxt-encryptionUrl"
                                        value={encryptionUrl}
                                        onChange={e => setEncryptionUrl(e.target.value)}
                                        placeholder="https://example.com/pgp-key.txt"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('hiring') && (
                        <div>
                            <div className={styles.securitytxt_mode_toggle}>
                                <Button
                                    label={t('label.mode.internal')}
                                    variant={hiringMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setHiringMode('node')}
                                />
                                <Button
                                    label={t('label.mode.external')}
                                    variant={hiringMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setHiringMode('url')}
                                />
                            </div>
                            {hiringMode === 'node' ? (
                                <NodePicker
                                    label={t('label.hiring')}
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="securityTxtPages"
                                    value={hiring}
                                    onChange={setHiring}
                                />
                            ) : (
                                <Field label={t('label.hiring')} id="securitytxt-hiringUrl">
                                    <Input
                                        id="securitytxt-hiringUrl"
                                        value={hiringUrl}
                                        onChange={e => setHiringUrl(e.target.value)}
                                        placeholder="https://example.com/careers"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('policy') && (
                        <div>
                            <div className={styles.securitytxt_mode_toggle}>
                                <Button
                                    label={t('label.mode.internal')}
                                    variant={policyMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setPolicyMode('node')}
                                />
                                <Button
                                    label={t('label.mode.external')}
                                    variant={policyMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setPolicyMode('url')}
                                />
                            </div>
                            {policyMode === 'node' ? (
                                <NodePicker
                                    label={t('label.policy')}
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="securityTxtPages"
                                    value={policy}
                                    onChange={setPolicy}
                                />
                            ) : (
                                <Field label={t('label.policy')} id="securitytxt-policyUrl">
                                    <Input
                                        id="securitytxt-policyUrl"
                                        value={policyUrl}
                                        onChange={e => setPolicyUrl(e.target.value)}
                                        placeholder="https://example.com/security/policy"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('preferredLanguages') && (
                        <Field label={t('label.preferredLanguages')} id="securitytxt-preferredLanguages">
                            <Input
                                id="securitytxt-preferredLanguages"
                                value={preferredLanguages}
                                onChange={e => setPreferredLanguages(e.target.value)}
                                placeholder="en, fr"
                            />
                        </Field>
                    )}

                    {OPTIONAL_FIELDS.some(f => !visibleFields.has(f.key)) && (
                        <div className={styles.securitytxt_add_fields}>
                            <Typography variant="caption" className={styles.securitytxt_add_fields_label}>
                                {t('label.addField')}
                            </Typography>
                            <div className={styles.securitytxt_add_fields_buttons}>
                                {OPTIONAL_FIELDS.filter(f => !visibleFields.has(f.key)).map(f => (
                                    <Button
                                        key={f.key}
                                        label={`+ ${t(f.labelKey)}`}
                                        variant="ghost"
                                        size="small"
                                        onClick={() => setVisibleFields(prev => new Set([...prev, f.key]))}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.securitytxt_actions}>
                        <Button
                            label={saving ? t('label.saving') : t('label.update')}
                            variant="primary"
                            isDisabled={saving}
                            onClick={handleSubmit}
                        />
                        <Button
                            label={t('label.cancel')}
                            variant="secondary"
                            isDisabled={saving}
                            onClick={handleCancel}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SecurityTxtSettings;
