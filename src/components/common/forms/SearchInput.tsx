import { Input } from 'antd';
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

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<Search size={16} />}
      allowClear
      style={style}
      onClear={() => onSearch?.('')}
    />
  );
}
