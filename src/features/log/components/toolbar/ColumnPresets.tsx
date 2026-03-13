import { useState } from 'react';
import { Columns, ChevronDown, Check } from 'lucide-react';

const STORAGE_KEY = 'logs_visible_cols_v2';

const ALL_COLS = [
  'timestamp',
  'level',
  'service_name',
  'host',
  'logger',
  'trace_id',
  'thread',
  'container',
  'message',
];

const PRESETS: Array<{ id: string; label: string; cols: string[] }> = [
  {
    id: 'default',
    label: 'Default',
    cols: ['timestamp', 'level', 'service_name', 'message'],
  },
  {
    id: 'apm',
    label: 'APM',
    cols: ['timestamp', 'level', 'service_name', 'trace_id', 'message'],
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    cols: ['timestamp', 'level', 'service_name', 'host', 'container', 'message'],
  },
  {
    id: 'verbose',
    label: 'Verbose',
    cols: [
      'timestamp',
      'level',
      'service_name',
      'host',
      'logger',
      'trace_id',
      'thread',
      'container',
      'message',
    ],
  },
];

function detectActivePreset(): string | null {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as Record<string, boolean> | null;
    if (!stored) return 'default';
    const visibleKeys = ALL_COLS.filter((k) => stored[k] !== false);
    for (const preset of PRESETS) {
      const presetSet = new Set(preset.cols);
      const visibleSet = new Set(visibleKeys);
      if (
        presetSet.size === visibleSet.size &&
        [...presetSet].every((k) => visibleSet.has(k))
      ) {
        return preset.id;
      }
    }
    return null;
  } catch {
    return 'default';
  }
}

export interface ColumnPresetsProps {
  onPresetApplied: () => void;
}

export default function ColumnPresets({ onPresetApplied }: ColumnPresetsProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(detectActivePreset);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    const visibility: Record<string, boolean> = {};
    ALL_COLS.forEach((col) => {
      visibility[col] = preset.cols.includes(col);
    });
    const serialized = JSON.stringify(visibility);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Notify other listeners (e.g. ObservabilityDataBoard that reads from storage)
    window.dispatchEvent(
      new StorageEvent('storage', { key: STORAGE_KEY, newValue: serialized }),
    );
    setActivePreset(preset.id);
    setOpen(false);
    onPresetApplied();
  };

  const activeLabel = PRESETS.find((p) => p.id === activePreset)?.label ?? 'Custom';

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
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <Columns size={13} />
        {activeLabel}
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
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
              minWidth: 180,
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.4))',
              padding: 6,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '4px 8px 6px',
              }}
            >
              Column Presets
            </div>

            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => applyPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 5,
                  cursor: 'pointer',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--literal-rgba-255-255-255-0p04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: preset.id === activePreset ? 600 : 400,
                      color:
                        preset.id === activePreset
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {preset.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {preset.cols.filter((c) => c !== 'message').join(', ')}
                  </div>
                </div>
                {preset.id === activePreset && (
                  <Check
                    size={12}
                    style={{
                      color: 'var(--literal-hex-5e60ce, #5e60ce)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
