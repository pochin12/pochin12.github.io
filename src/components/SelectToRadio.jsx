import React, { useState } from 'react';

function SelectToRadio() {
    const options = [
        { value: 'opcion1', label: 'Opción 1' },
        { value: 'opcion2', label: 'Opción 2' },
        { value: 'opcion3', label: 'Opción 3' },
    ];

    const [selectedOption, setSelectedOption] = useState('');

    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div>
            {options.map((option) => (
                <div key={option.value}>
                    <label>
                        <input
                            type="radio"
                            value={option.value}
                            checked={selectedOption === option.value}
                            onChange={handleRadioChange}
                        />
                        {option.label}
                    </label>
                </div>
            ))}
            <p>Opción seleccionada: {selectedOption}</p>
        </div>
    );
}

export default SelectToRadio;