import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";

const posts = [
  {
    title: "খামারের জন্য জিও শিট - টেকসই সমাধান!",
    platform: "Facebook",
    date: "Sep 17, 2026 10:30 AM",
    views: "12.4K",
    likes: "1.2K",
    comments: "320",
  },
  {
    title: "ট্রিপল তৈরির সম্পূর্ণ প্রক্রিয়া",
    platform: "YouTube",
    date: "Sep 16, 2026 06:20 PM",
    views: "28.5K",
    likes: "2.1K",
    comments: "420",
  },
  {
    title: "জিও কোটেড শেড এর আধুনিক সমাধান",
    platform: "WhatsApp",
    date: "Sep 16, 2026 11:15 AM",
    views: "8.4K",
    likes: "680",
    comments: "90",
  },
];

export default function RecentPosts() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="font-semibold text-slate-900">
          Recent Posts / Videos
        </h3>

        <button className="text-xs font-medium text-blue-600">
          View All
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 px-5 py-3 text-xs">
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-white">
          All
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50">
          Facebook
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50">
          YouTube
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50">
          Scheduled
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {posts.map((post) => (
          <div key={post.title} className="flex gap-3 px-5 py-4">
            <div className="h-16 w-20 shrink-0 rounded-lg bg-slate-200" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {post.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {post.date}
                  </p>
                </div>

                <span className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-medium text-green-600">
                  Published
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  {post.views}
                </span>

                <span className="flex items-center gap-1">
                  <ThumbsUp size={13} />
                  {post.likes}
                </span>

                <span className="flex items-center gap-1">
                  <MessageCircle size={13} />
                  {post.comments}
                </span>

                <span className="flex items-center gap-1">
                  <Share2 size={13} />
                  Share
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-slate-200 p-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
          Create Post
        </button>

        <button className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white">
          Upload Video
        </button>

        <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600">
          Schedule Post
        </button>
      </div>
    </section>
  );
}