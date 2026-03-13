import { useState, useCallback } from 'react';
import { Bookmark, BookmarkPlus, X, ChevronDown } from 'lucide-react';
import type { LogStructuredFilter } from '../../types';

const STORAGE_KEY = 'logs_saved_searches_v1';

interface SavedSearch {
  id: string;
  name: string;
  searchText: string;
  filters: LogStructuredFilter[];
}

function loadSearches(): SavedSearch[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedSearch[];
  } catch {
    return [];
  }
}

function persistSearches(searches: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export interface SavedSearchesProps {
  currentSearchText: string;
  currentFilters: LogStructuredFilter[];
  onApply: (searchText: string, filters: LogStructuredFilter[]) => void;
}

export default function SavedSearches({
  currentSearchText,
  currentFilters,
  onApply,
}: SavedSearchesProps) {
  const [open, setOpen] = useState(false);
  const [searches, setSearches] = useState<SavedSearch[]>(loadSearches);
  const [saveName, setSaveName] = useState('');

  const handleSave = useCallback(() => {
    const name = saveName.trim() || `Search ${new Date().toLocaleTimeString()}`;
    const next: SavedSearch[] = [
      ...searches,
      {
        id: Date.now().toString(),
        name,
        searchText: currentSearchText,
        filters: currentFilters,
      },
    ];
    setSearches(next);
    persistSearches(next);
    setSaveName('');
  }, [saveName, currentSearchText, currentFilters, searches]);

  const handleDelete = useCallback(
    (id: string) => {
      const next = searches.filter((s) => s.id !== id);
      setSearches(next);
      persistSearches(next);
    },
    [searches],
  );

  const hasCurrent = currentSearchText.trim().length > 0 || currentFilters.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--glass-border)',
          background: open ? 'var(--literal-rgba-94-96-206-0p12)' : 'transparent',
          color: 'var(--text-secondary)',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <Bookmark size={13} />
        Saved{searches.length > 0 ? ` (${searches.length})` : ''}
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          {/* backdrop to close on click outside */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              zIndex: 1000,
              minWidth: 260,
              maxWidth: 340,
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.4))',
              padding: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {searches.length === 0 && (
              <div
                style={{
                  padding: '10px 8px',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                No saved searches yet
              </div>
            )}

            {searches.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--literal-rgba-255-255-255-0p04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div
                  style={{ flex: 1, overflow: 'hidden' }}
                  onClick={() => {
                    onApply(s.searchText, s.filters);
                    setOpen(false);
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.name}
                  </div>
                  {s.searchText && (
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.searchText}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 2,
                    lineHeight: 1,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                  title="Delete saved search"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <div
              style={{
                borderTop:
                  searches.length > 0 ? '1px solid var(--glass-border)' : 'none',
                marginTop: searches.length > 0 ? 4 : 0,
                paddingTop: searches.length > 0 ? 8 : 4,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  paddingLeft: 4,
                }}
              >
                Save current search
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                  placeholder="Name (optional)"
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: 5,
                    fontSize: 12,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--literal-rgba-255-255-255-0p04)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={!hasCurrent}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: hasCurrent ? 'pointer' : 'not-allowed',
                    background: hasCurrent
                      ? 'var(--literal-rgba-94-96-206-0p18)'
                      : 'transparent',
                    border: '1px solid var(--literal-hex-5e60ce, #5e60ce)',
                    color: hasCurrent
                      ? 'var(--literal-hex-5e60ce, #5e60ce)'
                      : 'var(--text-muted)',
                    opacity: hasCurrent ? 1 : 0.5,
                  }}
                >
                  <BookmarkPlus size={12} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
