"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-300">Use Google to access the Admin UI.</p>
        <button
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}


