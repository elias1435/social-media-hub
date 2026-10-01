const campaigns = [
  {
    name: "Poultry Farm Awareness",
    objective: "Traffic",
    status: true,
    budget: "$20.00",
    spend: "$18.45",
    results: "1,245",
    reach: "86,230",
    cost: "$0.015",
  },
  {
    name: "Geo Sheet Sales",
    objective: "Conversions",
    status: true,
    budget: "$30.00",
    spend: "$28.20",
    results: "214",
    reach: "54,120",
    cost: "$0.132",
  },
  {
    name: "WhatsApp Messages",
    objective: "Messages",
    status: true,
    budget: "$25.00",
    spend: "$20.10",
    results: "482",
    reach: "72,450",
    cost: "$0.042",
  },
  {
    name: "Brand Awareness",
    objective: "Reach",
    status: false,
    budget: "$15.00",
    spend: "$0.00",
    results: "-",
    reach: "-",
    cost: "-",
  },
];

export default function AdsManager() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Facebook Ads Manager
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Campaign performance overview
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
          + Create Campaign
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 px-5 py-3 text-xs">
        <button className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-600">
          Campaigns
        </button>
        <button className="rounded-lg px-3 py-2 text-slate-500">
          Ad Sets
        </button>
        <button className="rounded-lg px-3 py-2 text-slate-500">
          Ads
        </button>
        <button className="rounded-lg px-3 py-2 text-slate-500">
          Audience
        </button>
        <button className="rounded-lg px-3 py-2 text-slate-500">
          Reports
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3">Campaign Name</th>
              <th className="px-4 py-3">Objective</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Spend</th>
              <th className="px-4 py-3">Results</th>
              <th className="px-4 py-3">Reach</th>
              <th className="px-4 py-3">Cost/Result</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.name}>
                <td className="px-5 py-4 font-medium text-slate-800">
                  {campaign.name}
                </td>

                <td className="px-4 py-4 text-slate-500">
                  {campaign.objective}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                      campaign.status
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {campaign.status ? "Active" : "Paused"}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {campaign.budget}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {campaign.spend}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {campaign.results}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {campaign.reach}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {campaign.cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}