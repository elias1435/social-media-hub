const logs = [
  {
    time: "10:35 AM",
    user: "Rahim Uddin",
    action: "Uploaded video",
    platform: "Facebook",
  },
  {
    time: "10:18 AM",
    user: "Karim Hossain",
    action: "Replied to message",
    platform: "WhatsApp",
  },
  {
    time: "09:55 AM",
    user: "Nabila Islam",
    action: "Created post",
    platform: "Facebook",
  },
  {
    time: "09:42 AM",
    user: "Admin",
    action: "Added new user",
    platform: "System",
  },
];

export default function ActivityLogs() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">Activity Logs</h3>
          <p className="mt-1 text-xs text-slate-400">
            Recent team activity
          </p>
        </div>

        <button className="text-xs font-medium text-blue-600">
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div
            key={`${log.time}-${log.user}`}
            className="grid grid-cols-[90px_1fr_1fr_120px] gap-3 px-5 py-4 text-xs"
          >
            <span className="text-slate-400">{log.time}</span>

            <span className="font-medium text-slate-700">
              {log.user}
            </span>

            <span className="text-slate-500">
              {log.action}
            </span>

            <span className="text-slate-500">
              {log.platform}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}