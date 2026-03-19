import { Search } from 'lucide-react';
import { ReactNode } from 'react';
import './FilterBar.css';

interface FilterSearchConfig {
  type: 'search';
  key: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  width?: number;
}

interface FilterSelectConfig {
  type: 'select';
  key: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  width?: number;
  allowClear?: boolean;
}

type FilterConfig = FilterSearchConfig | FilterSelectConfig;

interface FilterBarProps {
  filters?: FilterConfig[];
  actions?: ReactNode;
}

/**
 *
 * @param root0
 * @param root0.filters
 * @param root0.actions
 */
export default function FilterBar({ filters = [], actions }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {filters.map((filter) => {
          if (filter.type === 'search') {
            return (
              <div key={filter.key} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: filter.width || 300 }}>
                <Search size={16} style={{ position: 'absolute', left: 8, pointerEvents: 'none', color: 'var(--text-secondary, #999)' }} />
                <input
                  type="text"
                  placeholder={filter.placeholder || 'Search...'}
                  value={filter.value ?? ''}
                  onChange={(e) => {
                    filter.onChange?.(e);
                    filter.onSearch?.(e.target.value);
                  }}
                  style={{ paddingLeft: 30, height: 32, border: '1px solid var(--border-color, #d9d9d9)', borderRadius: 6, fontSize: 14, width: '100%' }}
                />
              </div>
            );
          }

          if (filter.type === 'select') {
            return (
              <select
                key={filter.key}
                value={filter.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  filter.onChange?.(val === '' ? null : (isNaN(Number(val)) ? val : Number(val)));
                }}
                style={{ width: filter.width || 160, height: 32, border: '1px solid var(--border-color, #d9d9d9)', borderRadius: 6, fontSize: 14, padding: '0 8px' }}
              >
                {filter.placeholder && (
                  <option value="">{filter.placeholder}</option>
                )}
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}
      </div>

      {actions && <div className="filter-bar-actions">{actions}</div>}
    </div>
  );
}
