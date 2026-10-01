const analytics = [
  { label: "Reach", value: "586,230", change: "+28%" },
  { label: "Engagement", value: "42,530", change: "+10%" },
  { label: "Messages", value: "12,450", change: "+32%" },
  { label: "Ad Spend", value: "$125.40", change: "+6%" },
];

export default function AnalyticsOverview() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="font-semibold text-slate-900">Analytics & Reports</h3>
        <p className="mt-1 text-xs text-slate-400">
          Monthly performance overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        {analytics.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 p-4"
          >
            <p className="text-xs text-slate-500">{item.label}</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-xl font-bold text-slate-900">
                {item.value}
              </p>

              <span className="text-xs font-semibold text-green-600">
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <div className="flex h-40 items-end gap-3 rounded-xl bg-slate-50 p-4">
          {[45, 72, 58, 85, 67, 92, 78, 96].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-blue-500"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}