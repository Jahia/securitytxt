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
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'success' | 'error' | 'cancel'
    const [visibleFields, setVisibleFields] = useState(new Set());
    const [contactError, setContactError] = useState('');
    const [expiresError, setExpiresError] = useState('');

    const OPTIONAL_FIELDS = [
        {key: 'acknowledgments', labelKey: 'label.acknowledgments'},
        {key: 'canonical', labelKey: 'label.canonical'},
        {key: 'encryption', labelKey: 'label.encryption'},
        {key: 'hiring', labelKey: 'label.hiring'},
        {key: 'policy', labelKey: 'label.policy'},
        {key: 'preferredLanguages', labelKey: 'label.preferredLanguages'}
    ];

    // M-07: update page title for SPA route — siteKey disambiguates multiple open tabs
    useEffect(() => {
        const prev = document.title;
        document.title = `Security.txt — ${siteKey} — Jahia Administration`;
        return () => {
            document.title = prev;
        };
    }, [siteKey]);

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
        if (settingsData && settingsData.securityTxt && settingsData.securityTxt.settings) {
            syncFromSettings(settingsData.securityTxt.settings);
        }
    }, [settingsData]);

    const handleSubmit = async () => {
        let firstErrorId = null;
        if (!contact.trim()) {
            setContactError(t('securitytxt.errors.contact.required'));
            if (!firstErrorId) {
                firstErrorId = 'securitytxt-contact';
            }
        } else {
            setContactError('');
        }

        if (!expires) {
            setExpiresError(t('securitytxt.errors.expires.required'));
            if (!firstErrorId) {
                firstErrorId = 'securitytxt-expires';
            }
        } else {
            setExpiresError('');
        }

        if (firstErrorId) {
            document.getElementById(firstErrorId)?.focus();
            return;
        }

        // 'saving' clears both live regions before the result lands, ensuring re-announcement on repeated saves
        setSaveStatus('saving');
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
            if (result.data && result.data.securityTxt && result.data.securityTxt.update) {
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
        if (settingsData && settingsData.securityTxt && settingsData.securityTxt.settings) {
            syncFromSettings(settingsData.securityTxt.settings);
        }

        setContactError('');
        setExpiresError('');
        setSaveStatus('cancel');
    };

    if (settingsLoading) {
        return <div className={styles.securitytxt_loading} role="status">{t('label.loading')}</div>;
    }

    if (settingsError) {
        return (
            <div className={styles.securitytxt_error} role="alert">
                {t('securitytxt.errors.load.failed')}: {settingsError.message}
            </div>
        );
    }

    return (
        <div>
            {/* C-01: two fixed-role live regions always in DOM — AT registers roles at mount, never mutate role post-mount */}
            <div role="status" aria-live="polite" aria-atomic="true" className={styles.securitytxt_sr_only}>
                {saveStatus === 'success' ? t('securitytxt.success.update') : saveStatus === 'cancel' ? t('securitytxt.cancel') : ''}
            </div>
            <div role="alert" aria-live="assertive" aria-atomic="true" className={styles.securitytxt_sr_only}>
                {saveStatus === 'error' ? t('securitytxt.errors.update.failed') : ''}
            </div>

            <div className={styles.securitytxt_page_header}>
                <h2>Security.txt - {siteKey}</h2>
            </div>
            <div className={styles.securitytxt_container}>
                <div className={styles.securitytxt_intro}>
                    <p>
                        {t('securitytxt.description')}{' '}
                        <a href="https://securitytxt.org/" target="_blank" rel="noreferrer">
                            security.txt
                            <span className={styles.securitytxt_sr_only}>{t('label.opensInNewTab')}</span>
                        </a>
                    </p>
                    <p>
                        {t('securitytxt.signature.hint')}:{' '}
                        <code>gpg --output security.txt.sig --detach-sig security.txt</code>
                    </p>
                </div>

                {saveStatus === 'success' && (
                    <div aria-hidden="true" className={`${styles.securitytxt_alert} ${styles['securitytxt_alert--success']}`}>
                        {t('securitytxt.success.update')}
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div aria-hidden="true" className={`${styles.securitytxt_alert} ${styles['securitytxt_alert--error']}`}>
                        {t('securitytxt.errors.update.failed')}
                    </div>
                )}

                <div className={styles.securitytxt_form}>
                    <Field label={t('label.contact')} id="securitytxt-contact">
                        <Input
                            id="securitytxt-contact"
                            value={contact}
                            onChange={e => {
                                setContact(e.target.value);
                                setContactError('');
                            }}
                            placeholder="mailto:security@example.com"
                            required
                            aria-required="true"
                            aria-invalid={contactError ? 'true' : undefined}
                            aria-describedby={contactError ? 'securitytxt-contact-error' : undefined}
                            autoComplete="off"
                        />
                        {contactError && (
                            <span id="securitytxt-contact-error" className={styles.securitytxt_error_msg}>
                                {contactError}
                            </span>
                        )}
                    </Field>

                    <Field label={t('label.expires')} id="securitytxt-expires">
                        <input
                            id="securitytxt-expires"
                            type="datetime-local"
                            className={styles.securitytxt_datetime_input}
                            value={expires}
                            onChange={e => {
                                setExpires(e.target.value);
                                setExpiresError('');
                            }}
                            required
                            aria-required="true"
                            aria-invalid={expiresError ? 'true' : undefined}
                            aria-describedby={expiresError ? 'securitytxt-expires-error' : undefined}
                            autoComplete="off"
                        />
                        {expiresError && (
                            <span id="securitytxt-expires-error" className={styles.securitytxt_error_msg}>
                                {expiresError}
                            </span>
                        )}
                    </Field>

                    {visibleFields.has('acknowledgments') && (
                        <div>
                            <span id="stxt-ack-mode-label" className={styles.securitytxt_mode_group_label}>
                                {t('label.mode.groupFor', {field: t('label.acknowledgments')})}
                            </span>
                            <div role="group" aria-labelledby="stxt-ack-mode-label" className={styles.securitytxt_mode_toggle}>
                                <Button
                                    type="button"
                                    label={t('label.mode.internal')}
                                    variant={acknowledgmentsMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={acknowledgmentsMode === 'node'}
                                    onClick={() => setAcknowledgmentsMode('node')}
                                />
                                <Button
                                    type="button"
                                    label={t('label.mode.external')}
                                    variant={acknowledgmentsMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={acknowledgmentsMode === 'url'}
                                    onClick={() => setAcknowledgmentsMode('url')}
                                />
                            </div>
                            {acknowledgmentsMode === 'node' ? (
                                <NodePicker
                                    label={t('label.acknowledgments')}
                                    fieldId="securitytxt-acknowledgments"
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="pages"
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
                                        autoComplete="url"
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
                                autoComplete="url"
                            />
                        </Field>
                    )}

                    {visibleFields.has('encryption') && (
                        <div>
                            <span id="stxt-enc-mode-label" className={styles.securitytxt_mode_group_label}>
                                {t('label.mode.groupFor', {field: t('label.encryption')})}
                            </span>
                            <div role="group" aria-labelledby="stxt-enc-mode-label" className={styles.securitytxt_mode_toggle}>
                                <Button
                                    type="button"
                                    label={t('label.mode.internal')}
                                    variant={encryptionMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={encryptionMode === 'node'}
                                    onClick={() => setEncryptionMode('node')}
                                />
                                <Button
                                    type="button"
                                    label={t('label.mode.external')}
                                    variant={encryptionMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={encryptionMode === 'url'}
                                    onClick={() => setEncryptionMode('url')}
                                />
                            </div>
                            {encryptionMode === 'node' ? (
                                <NodePicker
                                    label={t('label.encryption')}
                                    fieldId="securitytxt-encryption"
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_FILES}
                                    resultKey="files"
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
                                        autoComplete="url"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('hiring') && (
                        <div>
                            <span id="stxt-hire-mode-label" className={styles.securitytxt_mode_group_label}>
                                {t('label.mode.groupFor', {field: t('label.hiring')})}
                            </span>
                            <div role="group" aria-labelledby="stxt-hire-mode-label" className={styles.securitytxt_mode_toggle}>
                                <Button
                                    type="button"
                                    label={t('label.mode.internal')}
                                    variant={hiringMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={hiringMode === 'node'}
                                    onClick={() => setHiringMode('node')}
                                />
                                <Button
                                    type="button"
                                    label={t('label.mode.external')}
                                    variant={hiringMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={hiringMode === 'url'}
                                    onClick={() => setHiringMode('url')}
                                />
                            </div>
                            {hiringMode === 'node' ? (
                                <NodePicker
                                    label={t('label.hiring')}
                                    fieldId="securitytxt-hiring"
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="pages"
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
                                        autoComplete="url"
                                    />
                                </Field>
                            )}
                        </div>
                    )}

                    {visibleFields.has('policy') && (
                        <div>
                            <span id="stxt-policy-mode-label" className={styles.securitytxt_mode_group_label}>
                                {t('label.mode.groupFor', {field: t('label.policy')})}
                            </span>
                            <div role="group" aria-labelledby="stxt-policy-mode-label" className={styles.securitytxt_mode_toggle}>
                                <Button
                                    type="button"
                                    label={t('label.mode.internal')}
                                    variant={policyMode === 'node' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={policyMode === 'node'}
                                    onClick={() => setPolicyMode('node')}
                                />
                                <Button
                                    type="button"
                                    label={t('label.mode.external')}
                                    variant={policyMode === 'url' ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-pressed={policyMode === 'url'}
                                    onClick={() => setPolicyMode('url')}
                                />
                            </div>
                            {policyMode === 'node' ? (
                                <NodePicker
                                    label={t('label.policy')}
                                    fieldId="securitytxt-policy"
                                    siteKey={siteKey}
                                    query={GET_SECURITY_TXT_PAGES}
                                    resultKey="pages"
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
                                        autoComplete="url"
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
                                autoComplete="off"
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
                                        type="button"
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
                            type="button"
                            label={saving ? t('label.saving') : t('label.update')}
                            variant="primary"
                            isDisabled={saving}
                            onClick={handleSubmit}
                        />
                        <Button
                            type="button"
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
