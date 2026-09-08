import { createContext, useContext, type ElementType, type ReactNode } from "react";
import type { ThemeConfig } from "@/lib/cms/theme";
import { cn } from "@/lib/utils";

type Updater = (patch: (prev: ThemeConfig) => ThemeConfig) => void;

interface LiveEditValue {
  /** When true, front-end text nodes become editable in place. */
  editing: boolean;
  update: Updater | null;
}

const LiveEditContext = createContext<LiveEditValue>({ editing: false, update: null });

export function LiveEditProvider({
  editing,
  update,
  children,
}: LiveEditValue & { children: ReactNode }) {
  return (
    <LiveEditContext.Provider value={{ editing, update }}>{children}</LiveEditContext.Provider>
  );
}

export function useLiveEdit() {
  return useContext(LiveEditContext);
}

interface EditableProps {
  /** Current text. */
  value: string;
  /** Returns the next theme with the edited text applied. */
  commit: (prev: ThemeConfig, text: string) => ThemeConfig;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  label?: string;
}

/**
 * Renders plain text normally; in live-edit mode the same node becomes
 * contenteditable and writes straight back into the theme config on blur, so
 * every template edits directly on the front end.
 */
export function Editable({
  value,
  commit,
  as: Tag = "span",
  className,
  multiline,
  label,
}: EditableProps) {
  const { editing, update } = useLiveEdit();

  if (!editing || !update) return <Tag className={className}>{value}</Tag>;

  return (
    <Tag
      role="textbox"
      aria-label={label ?? "Editable text"}
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className={cn(
        className,
        "rounded-[3px] outline-1 outline-dashed outline-tt-blue/60 focus:outline-2 focus:outline-solid",
      )}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = (e.currentTarget.textContent ?? "").trim();
        if (text !== value) update((prev) => commit(prev, text));
      }}
    >
      {value}
    </Tag>
  );
}
