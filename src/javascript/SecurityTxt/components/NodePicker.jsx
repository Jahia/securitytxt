import React from 'react';
import styles from '../SecurityTxtSettings.scss';

export function NodePicker({ label, items, value, onChange, required }) {
    const handleChange = e => {
        onChange(e.target.value || null);
    };

    return (
        <div className={styles.securitytxt_field}>
            <label className={styles.securitytxt_label}>
                {label}
                {required && <span className={styles.securitytxt_required}> *</span>}
            </label>
            <select
                className={styles.securitytxt_select}
                value={value || ''}
                onChange={handleChange}
            >
                <option value="">— {label} —</option>
                {items && items.map(item => (
                    <option key={item.uuid} value={item.uuid} title={item.path}>
                        {item.path}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default NodePicker;
