import React, {useState} from 'react';
import {useQuery} from '@apollo/client';
import {Dropdown, Field, SearchInput} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from '../SecurityTxtSettings.scss';
import {GET_NODE_BY_UUID} from '../SecurityTxtSettings.gql';

export function NodePicker({label, fieldId, siteKey, query, resultKey, value, onChange}) {
    const {t} = useTranslation('securitytxt');
    const [searchTerm, setSearchTerm] = useState('');
    const [committedSearch, setCommittedSearch] = useState('');

    const {data, loading} = useQuery(query, {
        variables: {siteKey, searchTerm: committedSearch},
        skip: !committedSearch,
        fetchPolicy: 'cache-and-network'
    });

    const {data: nodeData} = useQuery(GET_NODE_BY_UUID, {
        variables: {uuid: value},
        skip: !value
    });

    // Build dropdown data from search results, ensuring the current value is always present
    const searchItems = (data && data[resultKey]) || [];
    const dropdownData = searchItems.map(item => ({label: item.displayName, value: item.uuid}));

    const valueInResults = dropdownData.some(item => item.value === value);
    if (value && !valueInResults && nodeData && nodeData.jcr && nodeData.jcr.nodeById) {
        const node = nodeData.jcr.nodeById;
        dropdownData.push({label: node.displayName || node.path, value: node.uuid});
    }

    const handleChange = (_event, item) => {
        onChange(item ? item.value : null);
    };

    const handleClear = () => {
        onChange(null);
    };

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            setCommittedSearch(searchTerm);
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setCommittedSearch('');
    };

    const searchId = `${fieldId}-search`;
    const dropdownId = `${fieldId}-dropdown`;
    const dropdownLabelId = `${fieldId}-picker-label`;

    return (
        <div>
            {/* C-02: SearchInput gets its own visible Field label */}
            <Field label={t('label.picker.searchLabel', {field: label})} id={searchId}>
                <SearchInput
                    id={searchId}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClear={handleSearchClear}
                    placeholder={t('label.picker.search')}
                />
            </Field>
            {/* C-02: Dropdown gets a visible span label; both aria-labelledby and aria-label for defensive AT support */}
            <div className={styles.securitytxt_picker_field}>
                <span id={dropdownLabelId} className={styles.securitytxt_picker_label}>{label}</span>
                <Dropdown
                    id={dropdownId}
                    aria-label={label}
                    aria-labelledby={dropdownLabelId}
                    data={dropdownData}
                    value={value || ''}
                    variant="outlined"
                    isLoading={loading}
                    placeholder={`— ${label} —`}
                    searchEmptyText={t('label.picker.noResults')}
                    onChange={handleChange}
                    onClear={value ? handleClear : undefined}
                />
            </div>
        </div>
    );
}

export default NodePicker;
