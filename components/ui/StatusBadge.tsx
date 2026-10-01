import type { ReactNode } from "react";
export default function StatusBadge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "blue" | "amber" | "slate" | "red" }) {
  const classes = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[tone]}`}>{children}</span>;
}
