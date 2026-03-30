import { EXPLORER_QUERY_HINTS_CLASSNAME } from './explorerQueryShell';

/**
 *
 */
export default function QueryKeyboardHints() {
  return (
    <div className={EXPLORER_QUERY_HINTS_CLASSNAME}>
      {[
        ['Click / Focus', 'Open field picker'],
        ['Tab', 'Auto-select when 1 match'],
        ['Enter', 'Commit value'],
        ['Backspace', 'Step back / remove last filter'],
        ['Escape', 'Close picker'],
      ].map(([shortcut, description]) => (
        <div
          key={shortcut}
          className="flex items-center gap-[10px] text-[11px] text-[color:var(--text-secondary)]"
        >
          <kbd className="inline-block px-[7px] py-[2px] text-[10px] font-mono bg-secondary border border-border rounded text-foreground whitespace-nowrap min-w-[80px] text-center">
            {shortcut}
          </kbd>
          <span>{description}</span>
        </div>
      ))}
    </div>
  );
}
