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

export function SecurityTxtSettings({siteKey}) {
    const {t} = useTranslation('securitytxt');

    const [contact, setContact] = useState('');
    const [encryption, setEncryption] = useState(null);
    const [acknowledgements, setAcknowledgements] = useState(null);
    const [policy, setPolicy] = useState(null);
    const [signature, setSignature] = useState(null);
    const [hiring, setHiring] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
    console.debug('%c security.txt: retrieving settings for %s', 'color: #463CBA', siteKey);
    const {data: settingsData, loading: settingsLoading, error: settingsError} = useQuery(
        GET_SECURITY_TXT_SETTINGS,
        {variables: {siteKey}, fetchPolicy: 'network-only'}
    );

    const [updateSecurityTxt, {loading: saving}] = useMutation(UPDATE_SECURITY_TXT, {
        refetchQueries: [{query: GET_SECURITY_TXT_SETTINGS, variables: {siteKey}}]
    });

    // Populate form when settings load
    useEffect(() => {
        if (settingsData && settingsData.securityTxtSettings) {
            const s = settingsData.securityTxtSettings;
            setContact(s.contact || '');
            setEncryption(s.encryption || null);
            setAcknowledgements(s.acknowledgements || null);
            setPolicy(s.policy || null);
            setSignature(s.signature || null);
            setHiring(s.hiring || null);
        }
    }, [settingsData]);

    const handleSubmit = async () => {
        setSaveStatus(null);
        try {
            const result = await updateSecurityTxt({
                variables: {
                    siteKey,
                    contact: contact || null,
                    encryption,
                    acknowledgements,
                    policy,
                    signature,
                    hiring
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
            setEncryption(s.encryption || null);
            setAcknowledgements(s.acknowledgements || null);
            setPolicy(s.policy || null);
            setSignature(s.signature || null);
            setHiring(s.hiring || null);
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

    return (<div>
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

                    <NodePicker
                        label={t('label.encryption')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_FILES}
                        resultKey="securityTxtFiles"
                        value={encryption}
                        onChange={setEncryption}
                    />

                    <NodePicker
                        label={t('label.acknowledgements')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={acknowledgements}
                        onChange={setAcknowledgements}
                    />

                    <NodePicker
                        label={t('label.policy')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={policy}
                        onChange={setPolicy}
                    />

                    <NodePicker
                        label={t('label.signature')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_FILES}
                        resultKey="securityTxtFiles"
                        value={signature}
                        onChange={setSignature}
                    />

                    <NodePicker
                        label={t('label.hiring')}
                        siteKey={siteKey}
                        query={GET_SECURITY_TXT_PAGES}
                        resultKey="securityTxtPages"
                        value={hiring}
                        onChange={setHiring}
                    />

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
