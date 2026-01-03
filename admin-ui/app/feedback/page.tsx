export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">Feedback</h1>
      <p className="mt-1 text-sm text-slate-300">
        Log testing feedback here so the VoiceAgent behavior can be modified.
      </p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm text-slate-300">Create feedback via API for now:</div>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-200">
{`curl -sS -X POST http://localhost:3100/api/feedback \\
  -H 'Content-Type: application/json' \\
  -d '{"source":"testing","message":"Agent spoke too fast. Please slow down and ask one question at a time."}' | jq`}
        </pre>
      </div>
    </main>
  );
}


