const messages = [
  {
    name: "Sabbir Hossain",
    message: "ভাই, জিও শিটের দাম কত?",
    time: "2m ago",
  },
  {
    name: "Farzana Akter",
    message: "১০০ ফুট শিট কিনতে চাই",
    time: "5m ago",
  },
  {
    name: "Md. Rafiq",
    message: "ডেলিভারি কবে পাব?",
    time: "12m ago",
  },
  {
    name: "Jannatul Nahar",
    message: "আমাদের জন্য কোন GSM ভালো?",
    time: "18m ago",
  },
];

export default function UnifiedInbox() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="font-semibold text-slate-900">
          Unified Inbox
        </h3>

        <button className="text-xs font-medium text-blue-600">
          View All
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 px-5 py-3 text-xs">
        <button className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-600">
          Facebook (320)
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500">
          WhatsApp (186)
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500">
          YouTube (75)
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {messages.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-5 py-4"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {item.name}
                </p>

                <span className="text-xs text-slate-400">
                  {item.time}
                </span>
              </div>

              <p className="mt-1 truncate text-xs text-slate-500">
                {item.message}
              </p>
            </div>

            <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
              Reply
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}