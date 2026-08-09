import { useState } from "react";
import { cn } from "@/lib/utils";

interface ScreenMetaProps {
  /** Rendered inside the Screen Options drawer. */
  screenOptions?: React.ReactNode;
  helpTabs?: { id: string; label: string; content: React.ReactNode }[];
}

/** The Screen Options / Help drawer strip that sits above the screen title. */
export function ScreenMeta({ screenOptions, helpTabs = [] }: ScreenMetaProps) {
  const [panel, setPanel] = useState<"options" | "help" | null>(null);
  const [activeTab, setActiveTab] = useState(helpTabs[0]?.id ?? "");

  const toggle = (next: "options" | "help") => setPanel((p) => (p === next ? null : next));

  return (
    <div className="relative">
      <div className="flex justify-end gap-px">
        {screenOptions && (
          <MetaButton active={panel === "options"} onClick={() => toggle("options")}>
            Screen Options
          </MetaButton>
        )}
        {helpTabs.length > 0 && (
          <MetaButton active={panel === "help"} onClick={() => toggle("help")}>
            Help
          </MetaButton>
        )}
      </div>

      {panel === "options" && (
        <div className="border-x border-b border-wp-border bg-wp-surface px-4 py-3">
          {screenOptions}
        </div>
      )}

      {panel === "help" && helpTabs.length > 0 && (
        <div className="flex border-x border-b border-wp-border bg-wp-surface">
          <ul className="w-[150px] shrink-0 border-r border-wp-border py-2">
            {helpTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full border-l-4 px-3 py-1.5 text-left text-[13px]",
                    activeTab === tab.id
                      ? "border-l-wp-blue bg-wp-body font-semibold text-wp-text"
                      : "border-l-transparent text-wp-blue hover:underline",
                  )}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex-1 px-4 py-3 text-[13px] leading-relaxed text-wp-text">
            {helpTabs.find((t) => t.id === activeTab)?.content}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        "rounded-b border-x border-b border-wp-border bg-wp-surface px-3 py-1 text-[13px] text-wp-muted hover:text-wp-text",
        active && "text-wp-text",
      )}
    >
      {children}
    </button>
  );
}
