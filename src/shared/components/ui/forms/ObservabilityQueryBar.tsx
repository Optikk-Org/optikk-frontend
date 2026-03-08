import { Keyboard, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

import QueryFieldPicker from './QueryFieldPicker';
import QueryKeyboardHints from './QueryKeyboardHints';
import QueryOperatorPicker from './QueryOperatorPicker';
import QueryValuePicker from './QueryValuePicker';

import {
  useQueryBarState,
  type QueryField,
  type ActiveFilter,
  DEFAULT_OPERATORS
} from '../common/hooks/useQueryBarState';

import './ObservabilityQueryBar.css';

type QueryBarSearchValue = string | string[] | number | boolean;

type SetFiltersFn = (filters: ActiveFilter[]) => void;
type SetSearchTextFn = (value: string) => void;
type ClearAllFn = () => void;

interface ObservabilityQueryBarProps {
  fields?: QueryField[];
  filters?: ActiveFilter[];
  setFilters: SetFiltersFn;
  searchText?: QueryBarSearchValue;
  setSearchText: SetSearchTextFn;
  onClearAll: ClearAllFn;
  placeholder?: string;
  className?: string;
  rightSlot?: ReactNode;
  valueHints?: Record<string, string[]>;
}

/**
 * Generic structured filter query bar for logs/traces observability pages.
 */
export default function ObservabilityQueryBar({
  fields = [],
  filters = [],
  setFilters,
  searchText = '',
  setSearchText,
  onClearAll,
  placeholder,
  className = '',
  rightSlot,
  valueHints,
}: ObservabilityQueryBarProps): JSX.Element {
  const { state, refs, actions } = useQueryBarState({
    fields,
    filters,
    setFilters,
    searchText: String(searchText || ''),
    setSearchText,
    onClearAll,
  });

  const {
    step,
    pendingField,
    pendingOp,
    fieldSearch,
    showHints,
    hasFilters,
  } = state;

  const { inputRef, wrapperRef } = refs;
  const {
    openDropdown,
    removeFilter,
    clearAll,
    onInputChange,
    handleKeyDown,
    toggleHints,
    pickField,
    pickOperator,
  } = actions;

  const filteredFields = fieldSearch
    ? fields.filter(
        (field) =>
          field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
          field.key.toLowerCase().includes(fieldSearch.toLowerCase()),
      )
    : fields;

  const groups = [...new Set(filteredFields.map((field) => field.group || 'Other'))];
  const operators = pendingField?.operators || DEFAULT_OPERATORS;
  const showDropdown = step === 1 || step === 2 || (step === 3 && !!valueHints && !!pendingField && !!valueHints[pendingField.key]);

  const inputPlaceholder =
    placeholder ||
    (step === 3
      ? `Value for "${pendingField?.label}" — press Enter to apply`
      : filters.length > 0
        ? 'Add another filter…'
        : 'Click to filter, or type to search…');

  const inputValue = step === 3 ? state.valueInput : step <= 1 ? fieldSearch : '';

  return (
    <div className={`oqb ${className}`} ref={wrapperRef}>
      <div
        className={`oqb__inner ${step > 0 ? 'oqb__inner--focused' : ''}`}
        onClick={() => {
          if (step === 0) openDropdown();
        }}
      >
        <Search size={14} className="oqb__search-icon" />

        <div className="oqb__pills">
          {filters.map((filter, index) => (
            <span key={index} className="oqb__pill">
              {filter.fieldGroup && <span className="oqb__pill-group">{filter.fieldGroup} /</span>}
              <span className="oqb__pill-field">{filter.fieldLabel || filter.field}</span>
              <span className="oqb__pill-op">{filter.operatorSymbol || filter.operator}</span>
              <span className="oqb__pill-value">"{filter.value}"</span>
              <button
                className="oqb__pill-close"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFilter(index);
                }}
                title="Remove filter"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {step >= 2 && pendingField && (
            <span className="oqb__pill oqb__pill--pending">
              <span className="oqb__pill-field">{pendingField.label}</span>
              {pendingOp && <span className="oqb__pill-op">{pendingOp.symbol}</span>}
              <button
                className="oqb__pill-close"
                onClick={(event) => {
                  event.stopPropagation();
                  actions.closeDropdown();
                }}
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="oqb__input"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (step === 0) openDropdown();
          }}
        />

        <div
          className="oqb__right"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {filters.length > 0 && (
            <span
              className="oqb__filter-count"
              title={`${filters.length} active filter${filters.length !== 1 ? 's' : ''}`}
            >
              {filters.length}
            </span>
          )}
          {hasFilters && (
            <button
              className="oqb__clear"
              onClick={(event) => {
                event.stopPropagation();
                clearAll();
              }}
              title="Clear all filters"
            >
              Clear all
            </button>
          )}
          <button
            className={`oqb__hint-btn ${showHints ? 'oqb__hint-btn--active' : ''}`}
            title="Keyboard shortcuts"
            onClick={toggleHints}
          >
            <Keyboard size={13} />
          </button>
          {rightSlot}
        </div>
      </div>

      {showHints && (
        <QueryKeyboardHints />
      )}

      {showDropdown && (
        <div className="oqb__dropdown" onMouseDown={(event) => event.preventDefault()}>
          {step === 1 && (
            <QueryFieldPicker
              fieldSearch={fieldSearch}
              filtersLength={filters.length}
              fieldsLength={fields.length}
              groups={groups}
              filteredFields={filteredFields}
              onPickField={pickField}
            />
          )}

          {step === 2 && pendingField && (
            <QueryOperatorPicker
              pendingField={pendingField}
              operators={operators}
              onPickOperator={pickOperator}
            />
          )}

          {step === 3 && pendingField && valueHints && valueHints[pendingField.key] && (
            <QueryValuePicker
              pendingField={pendingField}
              valueInput={state.valueInput}
              hints={valueHints[pendingField.key]}
              onPickValue={actions.pickValue}
            />
          )}
        </div>
      )}
    </div>
  );
}
