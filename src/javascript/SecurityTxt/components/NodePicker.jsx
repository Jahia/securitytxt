import React from 'react';
/**
 * A simple dropdown picker for selecting a JCR node (file or page).
 * Items are provided as [{uuid, path, name}] from the GraphQL query.
 */
export function NodePicker({ label, items, value, onChange, required }) {
    const handleChange = e => {
        onChange(e.target.value || null);
    };

    return (
        <div className="securitytxt-field">
            <label className="securitytxt-label">
                {label}
                {required && <span className="securitytxt-required"> *</span>}
            </label>
            <select
                className="securitytxt-select"
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
