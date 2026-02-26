import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ChevronRight, Keyboard } from 'lucide-react';
import './ObservabilityQueryBar.css';

const DEFAULT_OPERATORS = [
    { key: 'equals', label: 'equals', symbol: '=' },
    { key: 'not_equals', label: 'not equals', symbol: '!=' },
    { key: 'contains', label: 'contains', symbol: '~' },
    { key: 'gt', label: 'greater than', symbol: '>' },
    { key: 'lt', label: 'less than', symbol: '<' },
];

/**
 * ObservabilityQueryBar
 *
 * Generic structured-filter query bar that works for Logs, Traces, or any
 * observability page.  Pass `fields` to configure which attributes are
 * filterable for a given page.
 *
 * @param {Array<{key, label, icon, group?, operators?, suggestions?}>} fields
 * @param {Array}    filters       - active filter array (controlled)
 * @param {Function} setFilters    - setter
 * @param {string}   searchText    - free-text search value (controlled)
 * @param {Function} setSearchText - setter
 * @param {Function} onClearAll    - callback to wipe all state
 * @param {string}   placeholder   - input placeholder override
 * @param {string}   className     - extra class for outer wrapper
 * @param {ReactNode} rightSlot   - extra content rendered on the right (column picker, export, etc.)
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
}) {
    // 0=closed, 1=pick field, 2=pick operator, 3=enter value
    const [step, setStep] = useState(0);
    const [pendingField, setPendingField] = useState(null);
    const [pendingOp, setPendingOp] = useState(null);
    const [valueInput, setValueInput] = useState('');
    const [fieldSearch, setFieldSearch] = useState('');
    const [hoveredGroup, setHoveredGroup] = useState(null);
    const [showHints, setShowHints] = useState(false);

    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    const hasFilters = filters.length > 0 || searchText;

    /* ── Outside click closes ── */
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                closeDropdown();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const closeDropdown = useCallback(() => {
        setStep(0);
        setPendingField(null);
        setPendingOp(null);
        setValueInput('');
        setFieldSearch('');
        setHoveredGroup(null);
    }, []);

    const openDropdown = () => {
        if (step >= 1) return;
        setStep(1);
        setFieldSearch('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const pickField = (field) => {
        setPendingField(field);
        setStep(2);
    };

    const pickOperator = (op) => {
        setPendingOp(op);
        setStep(3);
        setValueInput('');
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const commitFilter = () => {
        if (!pendingField || !pendingOp || !valueInput.trim()) return;
        setFilters([
            ...filters,
            {
                field: pendingField.key,
                fieldLabel: pendingField.label,
                fieldGroup: pendingField.group || '',
                operator: pendingOp.key,
                operatorLabel: pendingOp.label,
                operatorSymbol: pendingOp.symbol,
                value: valueInput.trim(),
            },
        ]);
        closeDropdown();
    };

    const removeFilter = (index) => setFilters(filters.filter((_, i) => i !== index));

    const handleKeyDown = (e) => {
        if (step === 3 && e.key === 'Enter') {
            e.preventDefault();
            commitFilter();
        }
        if (e.key === 'Escape') {
            closeDropdown();
            inputRef.current?.blur();
        }
        if (e.key === 'Backspace') {
            if (step === 3 && valueInput === '') {
                e.preventDefault();
                setPendingOp(null);
                setStep(2);
            } else if (step === 2) {
                e.preventDefault();
                setPendingField(null);
                setStep(1);
                setFieldSearch('');
            } else if (step === 1 && fieldSearch === '') {
                e.preventDefault();
                closeDropdown();
            } else if (step === 0 && fieldSearch === '' && searchText === '' && filters.length > 0) {
                e.preventDefault();
                setFilters(filters.slice(0, -1));
            }
        }
        if (step === 1 && e.key === 'Tab' && filteredFields.length === 1) {
            e.preventDefault();
            pickField(filteredFields[0]);
        }
    };

    /* ── Field filtering + grouping ── */
    const filteredFields = fieldSearch
        ? fields.filter(
            (f) =>
                f.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
                f.key.toLowerCase().includes(fieldSearch.toLowerCase())
        )
        : fields;

    const groups = [...new Set(filteredFields.map((f) => f.group || 'Other'))];

    const operators = pendingField?.operators || DEFAULT_OPERATORS;

    const showDropdown = step === 1 || step === 2;

    /* ── Placeholder text ── */
    const inputPlaceholder =
        placeholder ||
        (step === 3
            ? `Value for "${pendingField?.label}" — press Enter to apply`
            : filters.length > 0
                ? 'Add another filter…'
                : 'Click to filter, or type to search…');

    /* ── Input value bound ── */
    const inputValue = step === 3 ? valueInput : step <= 1 ? fieldSearch : '';

    const onInputChange = (e) => {
        const v = e.target.value;
        if (step === 3) {
            setValueInput(v);
        } else {
            setFieldSearch(v);
            setSearchText(v);
            if (step === 0) setStep(1);
        }
    };

    return (
        <div className={`oqb ${className}`} ref={wrapperRef}>
            <div
                className={`oqb__inner ${step > 0 ? 'oqb__inner--focused' : ''}`}
                onClick={() => { if (step === 0) openDropdown(); }}
            >
                {/* Left icon */}
                <Search size={14} className="oqb__search-icon" />

                {/* Pills row */}
                <div className="oqb__pills">
                    {filters.map((f, i) => (
                        <span key={i} className="oqb__pill">
                            {f.fieldGroup && <span className="oqb__pill-group">{f.fieldGroup} /</span>}
                            <span className="oqb__pill-field">{f.fieldLabel}</span>
                            <span className="oqb__pill-op">{f.operatorSymbol}</span>
                            <span className="oqb__pill-value">"{f.value}"</span>
                            <button
                                className="oqb__pill-close"
                                onClick={(e) => { e.stopPropagation(); removeFilter(i); }}
                                title="Remove filter"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}

                    {/* Pending filter in progress */}
                    {step >= 2 && pendingField && (
                        <span className="oqb__pill oqb__pill--pending">
                            <span className="oqb__pill-field">{pendingField.label}</span>
                            {pendingOp && <span className="oqb__pill-op">{pendingOp.symbol}</span>}
                            <button
                                className="oqb__pill-close"
                                onClick={(e) => { e.stopPropagation(); closeDropdown(); }}
                            >
                                <X size={10} />
                            </button>
                        </span>
                    )}
                </div>

                {/* Text input */}
                <input
                    ref={inputRef}
                    type="text"
                    className="oqb__input"
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (step === 0) openDropdown(); }}
                />

                {/* Right controls */}
                <div className="oqb__right" onClick={(e) => e.stopPropagation()}>
                    {filters.length > 0 && (
                        <span className="oqb__filter-count" title={`${filters.length} active filter${filters.length !== 1 ? 's' : ''}`}>
                            {filters.length}
                        </span>
                    )}
                    {hasFilters && (
                        <button
                            className="oqb__clear"
                            onClick={(e) => { e.stopPropagation(); onClearAll(); closeDropdown(); }}
                            title="Clear all filters"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        className={`oqb__hint-btn ${showHints ? 'oqb__hint-btn--active' : ''}`}
                        title="Keyboard shortcuts"
                        onClick={() => setShowHints((v) => !v)}
                    >
                        <Keyboard size={13} />
                    </button>
                    {rightSlot}
                </div>
            </div>

            {/* ── Keyboard hints tooltip ── */}
            {showHints && (
                <div className="oqb__hints">
                    {[
                        ['Click / Focus', 'Open field picker'],
                        ['Tab', 'Auto-select when 1 match'],
                        ['Enter', 'Commit value'],
                        ['Backspace', 'Step back / remove last filter'],
                        ['Escape', 'Close picker'],
                    ].map(([key, desc]) => (
                        <div key={key} className="oqb__hint-row">
                            <kbd>{key}</kbd>
                            <span>{desc}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Field / Operator Dropdown ── */}
            {showDropdown && (
                <div className="oqb__dropdown" onMouseDown={(e) => e.preventDefault()}>
                    {/* ── Step 1: pick field ── */}
                    {step === 1 && (
                        <>
                            {fieldSearch === '' && (
                                <div className="oqb__dropdown-header">
                                    <SlidersHorizontal size={12} />
                                    <span>Filter by field</span>
                                    <span className="oqb__dropdown-header-hint">
                                        {filters.length > 0 ? `${filters.length} active` : `${fields.length} fields`}
                                    </span>
                                </div>
                            )}

                            {groups.map((group) => {
                                const groupFields = filteredFields.filter(
                                    (f) => (f.group || 'Other') === group
                                );
                                if (groupFields.length === 0) return null;
                                return (
                                    <div key={group}>
                                        {groups.length > 1 && (
                                            <div className="oqb__group-label">{group}</div>
                                        )}
                                        {groupFields.map((field) => (
                                            <div
                                                key={field.key}
                                                className="oqb__dropdown-item"
                                                onClick={() => pickField(field)}
                                                onMouseEnter={() => setHoveredGroup(field.key)}
                                                onMouseLeave={() => setHoveredGroup(null)}
                                            >
                                                <span className="oqb__dropdown-icon">{field.icon}</span>
                                                <span className="oqb__dropdown-name">{field.label}</span>
                                                <span className="oqb__dropdown-key">{field.key}</span>
                                                <ChevronRight size={12} className="oqb__dropdown-arrow" />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}

                            {filteredFields.length === 0 && (
                                <div className="oqb__dropdown-empty">No fields match "{fieldSearch}"</div>
                            )}
                        </>
                    )}

                    {/* ── Step 2: pick operator ── */}
                    {step === 2 && pendingField && (
                        <>
                            <div className="oqb__dropdown-header">
                                <span className="oqb__dropdown-icon">{pendingField.icon}</span>
                                <strong>{pendingField.label}</strong>
                                <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>— select operator</span>
                            </div>
                            {operators.map((op) => (
                                <div
                                    key={op.key}
                                    className="oqb__dropdown-item"
                                    onClick={() => pickOperator(op)}
                                >
                                    <span className="oqb__op-symbol">{op.symbol}</span>
                                    <span className="oqb__dropdown-name">{op.label}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
