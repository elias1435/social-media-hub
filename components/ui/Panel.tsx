import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
      <div><h3 className="font-semibold text-slate-900">{title}</h3>{description ? <p className="mt-1 text-xs text-slate-400">{description}</p> : null}</div>
      {action}
    </div>
  );
}
