import { Search } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';

import type { CSSProperties, ChangeEvent } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  style?: CSSProperties;
}

/**
 * Debounced search input. Triggers onSearch after the user stops typing.
 * @param root0
 * @param root0.placeholder
 * @param root0.onSearch
 * @param root0.debounceMs
 * @param root0.style
 */
export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  style,
}: SearchInputProps): JSX.Element {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}>
      <Search size={16} style={{ position: 'absolute', left: 8, pointerEvents: 'none', color: 'var(--text-secondary, #999)' }} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ paddingLeft: 30, paddingRight: value ? 28 : 8, height: 32, border: '1px solid var(--border-color, #d9d9d9)', borderRadius: 6, fontSize: 14, width: '100%' }}
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear"
          style={{ position: 'absolute', right: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary, #999)' }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
