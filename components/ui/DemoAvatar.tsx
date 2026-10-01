export default function DemoAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 font-bold text-slate-600 ${sizeClass}`}>{initials}</div>;
}
