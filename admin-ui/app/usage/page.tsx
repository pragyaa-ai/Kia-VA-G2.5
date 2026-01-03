export default function UsagePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">Usage</h1>
      <p className="mt-1 text-sm text-slate-300">
        Call/session usage tracking (calls + minutes). We’ll wire this to telephony events next.
      </p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-300">
        Coming next: a table + filters (campaign, date range) and an endpoint to ingest call end
        events from telephony.
      </div>
    </main>
  );
}


