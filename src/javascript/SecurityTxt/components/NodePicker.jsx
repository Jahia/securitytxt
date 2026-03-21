import React from 'react';
import {Dropdown, Field} from '@jahia/moonstone';

export function NodePicker({label, items, value, onChange}) {
    const data = (items || []).map(item => ({
        label: item.path,
        value: item.uuid
    }));

    const handleChange = (_event, item) => {
        onChange(item ? item.value : null);
    };

    const handleClear = () => {
        onChange(null);
    };

    return (
        <Field label={label} id={`securitytxt-picker-${label}`}>
            <Dropdown
                data={data}
                value={value || ''}
                variant="outlined"
                placeholder={`— ${label} —`}
                onChange={handleChange}
                onClear={value ? handleClear : undefined}
            />
        </Field>
    );
}

export default NodePicker;
