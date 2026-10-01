const days = [
  { day: "Sun", date: 13 },
  { day: "Mon", date: 14 },
  { day: "Tue", date: 15 },
  { day: "Wed", date: 16 },
  { day: "Thu", date: 17 },
  { day: "Fri", date: 18 },
  { day: "Sat", date: 19 },
];

const events = [
  { day: 14, label: "FB Post", time: "10:00 AM" },
  { day: 16, label: "YouTube", time: "12:00 PM" },
  { day: 17, label: "FB Reel", time: "11:00 AM" },
  { day: 18, label: "WhatsApp", time: "3:00 PM" },
];

export default function ContentPlanner() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">Content Planner</h3>
          <p className="mt-1 text-xs text-slate-400">
            Scheduled posts and publishing calendar
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
          + Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
        {days.map((item) => (
          <div key={item.day} className="border-r border-slate-200 px-2 py-3 last:border-r-0">
            {item.day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[220px]">
        {days.map((item) => {
          const dayEvents = events.filter((event) => event.day === item.date);

          return (
            <div
              key={item.date}
              className="border-r border-slate-200 p-3 last:border-r-0"
            >
              <p className="text-xs font-medium text-slate-500">
                {item.date}
              </p>

              <div className="mt-3 space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.label}
                    className="rounded-lg bg-blue-50 px-2 py-2 text-[11px] text-blue-700"
                  >
                    <p className="font-semibold">{event.label}</p>
                    <p className="mt-1 text-blue-500">{event.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}