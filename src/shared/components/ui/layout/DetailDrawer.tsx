import { ReactNode } from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface DetailDrawerField {
  label: string;
  key: string;
  render?: (value: unknown, data: Record<string, unknown>) => ReactNode;
}

interface DetailDrawerSection {
  title?: string;
  fields: DetailDrawerField[];
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  sections?: DetailDrawerSection[];
  data: Record<string, unknown>;
  extra?: ReactNode;
}

export default function DetailDrawer({
  open,
  onClose,
  title = 'Details',
  width = 640,
  sections = [],
  data,
  extra,
}: DetailDrawerProps) {
  if (!data) return null;

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) onClose(); }} direction="right">
      <DrawerContent className="top-0 right-0 left-auto overflow-auto" style={{ width }}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose
            aria-label="Close"
            className="bg-transparent border-none cursor-pointer text-lg leading-none"
          >
            &times;
          </DrawerClose>
        </DrawerHeader>
        <div className="px-6 py-4 flex-1 overflow-auto">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {section.title && (
                <h4 className="text-[color:var(--text-primary)] text-[14px] font-semibold mb-4 pb-2 border-b border-[color:var(--glass-border)] tracking-[0.02em]">
                  {section.title}
                </h4>
              )}
              <table className="w-full border-collapse text-[13px] mb-4">
                <tbody>
                  {section.fields.map((field) => (
                    <tr key={field.key} className="border-b border-border">
                      <td className="py-2 px-3 font-medium w-[30%] align-top">{field.label}</td>
                      <td className="py-2 px-3">
                        {field.render
                          ? field.render(data[field.key], data)
                          : renderValue(data[field.key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {extra}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function renderValue(value: unknown) {
  if (value == null) return <span className="text-[color:var(--text-secondary,#999)]">-</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return <pre className="m-0 text-xs">{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
}
