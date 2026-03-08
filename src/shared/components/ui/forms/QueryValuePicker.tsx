import { ReactNode } from 'react';

interface QueryField {
  key: string;
  label: string;
  icon?: ReactNode;
  group?: string;
}

interface QueryValuePickerProps {
  pendingField: QueryField;
  valueInput: string;
  hints: string[];
  onPickValue: (value: string) => void;
}

export default function QueryValuePicker({
  pendingField,
  valueInput,
  hints,
  onPickValue,
}: QueryValuePickerProps) {
  const filteredHints = hints.filter(h => h.toLowerCase().includes(valueInput.toLowerCase()));

  return (
    <>
      <div className="oqb__dropdown-header">
        <span className="oqb__dropdown-icon">{pendingField.icon}</span>
        <strong>{pendingField.label}</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
          — select value
        </span>
      </div>
      {filteredHints.map((hint) => (
        <div
          key={hint}
          className="oqb__dropdown-item"
          onClick={() => onPickValue(hint)}
        >
          <span className="oqb__dropdown-name">{hint}</span>
        </div>
      ))}
      {filteredHints.length === 0 && valueInput !== '' && (
        <div className="oqb__dropdown-empty">No suggestions match "{valueInput}"</div>
      )}
      {filteredHints.length === 0 && valueInput === '' && (
        <div className="oqb__dropdown-empty">No suggestions available</div>
      )}
    </>
  );
}
