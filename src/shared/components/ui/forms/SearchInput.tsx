import { Search } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  style,
  className,
}: SearchInputProps): JSX.Element {
  const [value, setValue] = useState('');

  const debouncedSearch = useDebouncedCallback((newValue: string) => {
    onSearch?.(newValue);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    debouncedSearch.cancel();
    onSearch?.('');
  };

  return (
    <div className={cn('relative inline-flex items-center', className)} style={style}>
      <Search
        size={16}
        className="absolute left-2 pointer-events-none text-[var(--text-secondary,#999)]"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-[30px] h-8 border border-[var(--border-color,#d9d9d9)] rounded-md text-sm w-full"
        style={{ paddingRight: value ? 28 : 8 }}
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear"
          className="absolute right-1.5 bg-transparent border-none cursor-pointer text-sm text-[var(--text-secondary,#999)]"
        >
          &times;
        </button>
      )}
    </div>
  );
}
