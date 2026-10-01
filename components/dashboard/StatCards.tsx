import {
  PanelsTopLeft,
  PlaySquare,
  MessageCircle,
  Megaphone,
  MessagesSquare,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Facebook Pages",
    value: "8",
    sublabel: "Total Pages Connected",
    change: "+25%",
    icon: PanelsTopLeft,
  },
  {
    label: "YouTube Channels",
    value: "8",
    sublabel: "Total Channels Connected",
    change: "+18%",
    icon: PlaySquare,
  },
  {
    label: "WhatsApp Numbers",
    value: "8",
    sublabel: "Total Numbers Connected",
    change: "+32%",
    icon: MessageCircle,
  },
  {
    label: "Active Ad Campaigns",
    value: "14",
    sublabel: "Running Campaigns",
    change: "+12%",
    icon: Megaphone,
  },
  {
    label: "Total Messages / Comments",
    value: "1,248",
    sublabel: "FB + WA + YouTube",
    change: "+40%",
    icon: MessagesSquare,
  },
  {
    label: "Total Reach",
    value: "586,230",
    sublabel: "All Platforms",
    change: "+28%",
    icon: BarChart3,
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
                  <Icon size={22} />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>

                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <TrendingUp size={13} />
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {stat.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}