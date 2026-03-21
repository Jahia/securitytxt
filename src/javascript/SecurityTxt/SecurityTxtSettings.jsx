import React, {useEffect, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {Button, Field, Input} from '@jahia/moonstone';
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
    const [canonical, setCanonical] = useState('');
    const [encryption, setEncryption] = useState(null);
    const [hiring, setHiring] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [preferredLanguages, setPreferredLanguages] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'

    console.debug('%c security.txt: retrieving settings for %s', 'color: #463CBA', siteKey);
    const {data: settingsData, loading: settingsLoading, error: settingsError} = useQuery(
        GET_SECURITY_TXT_SETTINGS,
        {variables: {siteKey}, fetchPolicy: 'network-only'}
    );

    const [updateSecurityTxt, {loading: saving}] = useMutation(UPDATE_SECURITY_TXT, {
        refetchQueries: [{query: GET_SECURITY_TXT_SETTINGS, variables: {siteKey}}]
    });

    useEffect(() => {
        if (settingsData && settingsData.securityTxtSettings) {
            const s = settingsData.securityTxtSettings;
            setContact(s.contact || '');
            setExpires(toDatetimeLocal(s.expires));
            setAcknowledgments(s.acknowledgments || null);
            setCanonical(s.canonical || '');
            setEncryption(s.encryption || null);
            setHiring(s.hiring || null);
            setPolicy(s.policy || null);
            setPreferredLanguages(s.preferredLanguages || '');
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
                    acknowledgments,
                    canonical: canonical || null,
                    encryption,
                    hiring,
                    policy,
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
            const s = settingsData.securityTxtSettings;
            setContact(s.contact || '');
            setExpires(toDatetimeLocal(s.expires));
            setAcknowledgments(s.acknowledgments || null);
            setCanonical(s.canonical || '');
            setEncryption(s.encryption || null);
            setHiring(s.hiring || null);
            setPolicy(s.policy || null);
            setPreferredLanguages(s.preferredLanguages || '');
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

                    <NodePicker
                        label={t('label.acknowledgments')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={acknowledgments}
                        onChange={setAcknowledgments}
                    />

                    <Field label={t('label.canonical')} id="securitytxt-canonical">
                        <Input
                            id="securitytxt-canonical"
                            value={canonical}
                            onChange={e => setCanonical(e.target.value)}
                            placeholder="https://example.com/.well-known/security.txt"
                        />
                    </Field>

                    <NodePicker
                        label={t('label.encryption')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_FILES}
                        resultKey="securityTxtFiles"
                        value={encryption}
                        onChange={setEncryption}
                    />

                    <NodePicker
                        label={t('label.hiring')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={hiring}
                        onChange={setHiring}
                    />

                    <NodePicker
                        label={t('label.policy')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={policy}
                        onChange={setPolicy}
                    />

                    <Field label={t('label.preferredLanguages')} id="securitytxt-preferredLanguages">
                        <Input
                            id="securitytxt-preferredLanguages"
                            value={preferredLanguages}
                            onChange={e => setPreferredLanguages(e.target.value)}
                            placeholder="en, fr"
                        />
                    </Field>

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
