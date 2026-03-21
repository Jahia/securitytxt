import React, {useEffect, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
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

    console.debug('%c security.txt: retrieving files data for %s', 'color: #463CBA', siteKey);
    const {data: filesData, loading: filesLoading} = useQuery(
        GET_SECURITY_TXT_FILES,
        {variables: {siteKey}}
    );

    console.debug('%c security.txt: retrieving pages data for %s', 'color: #463CBA', siteKey);
    const {data: pagesData, loading: pagesLoading} = useQuery(
        GET_SECURITY_TXT_PAGES,
        {variables: {siteKey}}
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

    const handleSubmit = async e => {
        e.preventDefault();
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

    if (settingsLoading || filesLoading || pagesLoading) {
        return <div className={styles.securitytxt_loading}>{t('label.loading')}</div>;
    }

    if (settingsError) {
        return (
            <div className="{styles.securitytxt-error">
                {t('securitytxt.errors.load.failed')}: {settingsError.message}
            </div>
        );
    }

    const files = filesData ? filesData.securityTxtFiles : [];
    const pages = pagesData ? pagesData.securityTxtPages : [];

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
                    <div className="styles.securitytxt_alert securitytxt_alert--success">
                        {t('securitytxt.success.update')}
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="styles.securitytxt_alert securitytxt_alert--error">
                        {t('securitytxt.errors.update.failed')}
                    </div>
                )}

                <form className={styles.securitytxt_form} onSubmit={handleSubmit}>
                    <div className={styles.securitytxt_field}>
                        <label className={styles.securitytxt_label} htmlFor="securitytxt-contact">
                            {t('label.contact')}
                        </label>
                        <input
                            id="securitytxt-contact"
                            type="text"
                            className={styles.securitytxt_input}
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                            placeholder="mailto:security@example.com"
                        />
                    </div>

                    <NodePicker
                        label={t('label.encryption')}
                        items={files}
                        value={encryption}
                        onChange={setEncryption}
                    />

                    <NodePicker
                        label={t('label.acknowledgements')}
                        items={pages}
                        value={acknowledgements}
                        onChange={setAcknowledgements}
                    />

                    <NodePicker
                        label={t('label.policy')}
                        items={pages}
                        value={policy}
                        onChange={setPolicy}
                    />

                    <NodePicker
                        label={t('label.signature')}
                        items={files}
                        value={signature}
                        onChange={setSignature}
                    />

                    <NodePicker
                        label={t('label.hiring')}
                        items={pages}
                        value={hiring}
                        onChange={setHiring}
                    />

                    <div className={styles.securitytxt_actions}>
                        <button
                            type="submit"
                            className="{styles.securitytxt_btn styles.securitytxt_btn_primary}"
                            disabled={saving}
                        >
                            {saving ? t('label.saving') : t('label.update')}
                        </button>
                        <button
                            type="button"
                            className={styles.securitytxt_btn}
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            {t('label.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SecurityTxtSettings;
