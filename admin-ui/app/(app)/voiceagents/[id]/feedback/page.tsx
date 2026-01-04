"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

interface FeedbackItem {
  id: string;
  source: string;
  message: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadFeedback = async () => {
    const res = await fetch(`/api/feedback?voiceAgentId=${params.id}`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadFeedback().finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voiceAgentId: params.id, message }),
    });
    setMessage("");
    await loadFeedback();
    setSaving(false);
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Describe what worked or what needs improvement..."
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !message.trim()}>
              {saving ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Feedback</h2>
        {items.length === 0 ? (
          <Card className="p-6 text-center text-slate-500">No feedback yet.</Card>
        ) : (
          <div className="space-y-3">
            {items.map((fb) => (
              <Card key={fb.id} className="p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{fb.source}</span>
                  <span>{new Date(fb.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-700">{fb.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

