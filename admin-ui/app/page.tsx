import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <h1 className="text-2xl font-semibold">Kia VoiceAgent Admin</h1>
        <p className="mt-2 text-slate-300">
          Manage call flows, guardrails, voice settings, and track usage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/campaigns"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            Campaigns
          </Link>
          <Link
            href="/feedback"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Feedback
          </Link>
          <Link
            href="/usage"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Usage
          </Link>
        </div>
      </div>
    </main>
  );
}


