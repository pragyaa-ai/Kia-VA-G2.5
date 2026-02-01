"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

// Default SI payload template
const DEFAULT_SI_TEMPLATE = {
  id: "bot_{call_id}",
  customer_name: "{agent_name}",
  call_ref_id: "{call_id}",
  call_vendor: "Waybeo",
  recording_url: "",
  start_time: "{start_time}",
  end_time: "{end_time}",
  duration: "{duration_sec}",
  store_code: "{store_code}",
  customer_number: "{customer_number}",
  language: {
    welcome: "hindi",
    conversational: "{detected_language}"
  },
  dealer_routing: {
    status: "{transfer_status}",
    reason: "{transfer_reason}",
    time: "{end_time}"
  },
  dropoff: {
    time: "{end_time}",
    action: "email"
  },
  completion_status: "{completion_status}",
  response_data: [
    {
      key_label: "What's your name",
      key_value: "name",
      key_response: "{extracted.name}",
      attempts: 1,
      remarks: "{extracted.name ? 'verified' : 'not_captured'}"
    },
    {
      key_label: "Which model you are looking for",
      key_value: "model",
      key_response: "{extracted.model}",
      attempts: 1,
      remarks: "{extracted.model ? 'verified' : 'not_captured'}"
    },
    {
      key_label: "Do you want to schedule a test drive",
      key_value: "test_drive",
      key_response: "{extracted.test_drive}",
      attempts: 1,
      remarks: "{extracted.test_drive ? 'verified' : 'not_captured'}"
    },
    {
      key_label: "What is your email id",
      key_value: "email",
      key_response: "{extracted.email}",
      attempts: 0,
      remarks: "{extracted.email ? 'verified' : 'not_captured'}"
    }
  ]
};

// Default Waybeo payload template
const DEFAULT_WAYBEO_TEMPLATE = {
  ucid: "{call_id}",
  call_status: "{completion_status}",
  call_start_time: "{start_time}",
  call_end_time: "{end_time}",
  call_duration: "{duration_sec}",
  caller_number: "{customer_number}",
  agent_id: "{agent_slug}",
  store_code: "{store_code}",
  transcript: "{transcript_text}",
  sales_data: {
    full_name: "{extracted.name}",
    car_model: "{extracted.model}",
    test_drive_interest: "{extracted.test_drive}",
    email_id: "{extracted.email}"
  },
  analytics: {
    total_exchanges: "{analytics.total_exchanges}",
    user_messages: "{analytics.user_messages}",
    assistant_messages: "{analytics.assistant_messages}"
  }
};

export default function InstructionsPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState("");
  const [siPayloadTemplate, setSiPayloadTemplate] = useState("");
  const [waybeoPayloadTemplate, setWaybeoPayloadTemplate] = useState("");
  const [agentName, setAgentName] = useState("");
  const [slug, setSlug] = useState("");
  const [activeTab, setActiveTab] = useState<"instructions" | "config" | "si" | "waybeo">("instructions");

  useEffect(() => {
    fetch(`/api/voiceagents/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSystemInstructions(data.systemInstructions || "");
        setAgentName(data.name || "");
        setSlug(data.slug || "");
        setSiPayloadTemplate(
          data.siPayloadTemplate 
            ? JSON.stringify(data.siPayloadTemplate, null, 2)
            : JSON.stringify(DEFAULT_SI_TEMPLATE, null, 2)
        );
        setWaybeoPayloadTemplate(
          data.waybeoPayloadTemplate
            ? JSON.stringify(data.waybeoPayloadTemplate, null, 2)
            : JSON.stringify(DEFAULT_WAYBEO_TEMPLATE, null, 2)
        );
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    let siTemplate = null;
    let waybeoTemplate = null;
    
    try {
      siTemplate = JSON.parse(siPayloadTemplate);
    } catch {
      alert("Invalid JSON in SI Payload Template");
      setSaving(false);
      return;
    }
    
    try {
      waybeoTemplate = JSON.parse(waybeoPayloadTemplate);
    } catch {
      alert("Invalid JSON in Waybeo Payload Template");
      setSaving(false);
      return;
    }
    
    const res = await fetch(`/api/voiceagents/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        systemInstructions,
        siPayloadTemplate: siTemplate,
        waybeoPayloadTemplate: waybeoTemplate,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const resetSiTemplate = () => {
    setSiPayloadTemplate(JSON.stringify(DEFAULT_SI_TEMPLATE, null, 2));
  };

  const resetWaybeoTemplate = () => {
    setWaybeoPayloadTemplate(JSON.stringify(DEFAULT_WAYBEO_TEMPLATE, null, 2));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: "instructions" as const, label: "System Instructions" },
    { id: "config" as const, label: "Configuration" },
    { id: "si" as const, label: "SI Payload" },
    { id: "waybeo" as const, label: "Waybeo Payload" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* System Instructions Tab */}
      {activeTab === "instructions" && (
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Instructions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Full prompt/instructions used by the VoiceAgent during calls.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Instructions for {agentName}
            </label>
            <Textarea
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              rows={25}
              placeholder="Enter the full system instructions for this VoiceAgent..."
              className="font-mono text-sm leading-relaxed"
            />
            <p className="mt-2 text-xs text-slate-400">
              {systemInstructions.length.toLocaleString()} characters
            </p>
          </div>
        </Card>
      )}

      {/* Configuration Tab */}
      {activeTab === "config" && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Technical configuration for this VoiceAgent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Agent Identifier</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Slug:</span>
                  <code className="bg-white px-2 py-1 rounded border text-sm font-mono">{slug}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Name:</span>
                  <span className="text-sm font-medium text-slate-700">{agentName}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Telephony Endpoint</h3>
              <div className="space-y-2">
                <div className="text-sm text-slate-500">WSS URL:</div>
                <code className="block bg-white px-2 py-2 rounded border text-xs font-mono break-all">
                  wss://ws-singleinterfacews.pragyaa.ai/wsNew1?agent={slug}
                </code>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Data Storage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Directory:</span>
                  <code className="bg-white px-2 py-0.5 rounded border font-mono text-xs">/data/{slug === "spotlight" ? "kia2" : slug}/</code>
                </div>
                <div className="text-slate-500 text-xs space-y-1">
                  <div>• <code>transcripts/</code> - Conversation transcripts</div>
                  <div>• <code>si/</code> - SI webhook payloads</div>
                  <div>• <code>waybeo/</code> - Waybeo callback payloads</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Post-Call Actions</h3>
              <div className="text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Save transcript to file
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Generate & save SI payload
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Generate & save Waybeo payload
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Push to Admin UI database
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SI Payload Template Tab */}
      {activeTab === "si" && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">SI Payload Template</h2>
              <p className="mt-1 text-sm text-slate-500">
                JSON structure for Single Interface webhook payload. Use placeholders like{" "}
                <code className="bg-slate-100 px-1 rounded">{"{call_id}"}</code>,{" "}
                <code className="bg-slate-100 px-1 rounded">{"{extracted.name}"}</code> etc.
              </p>
            </div>
            <Button variant="secondary" onClick={resetSiTemplate} className="text-xs">
              Reset to Default
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Available Placeholders</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-700">
              <code>{"{call_id}"}</code>
              <code>{"{agent_name}"}</code>
              <code>{"{agent_slug}"}</code>
              <code>{"{start_time}"}</code>
              <code>{"{end_time}"}</code>
              <code>{"{duration_sec}"}</code>
              <code>{"{customer_number}"}</code>
              <code>{"{store_code}"}</code>
              <code>{"{completion_status}"}</code>
              <code>{"{detected_language}"}</code>
              <code>{"{extracted.name}"}</code>
              <code>{"{extracted.model}"}</code>
              <code>{"{extracted.test_drive}"}</code>
              <code>{"{extracted.email}"}</code>
              <code>{"{transfer_status}"}</code>
              <code>{"{transfer_reason}"}</code>
            </div>
          </div>

          <div>
            <Textarea
              value={siPayloadTemplate}
              onChange={(e) => setSiPayloadTemplate(e.target.value)}
              rows={25}
              placeholder="Enter SI payload JSON template..."
              className="font-mono text-xs leading-relaxed"
            />
          </div>
        </Card>
      )}

      {/* Waybeo Payload Template Tab */}
      {activeTab === "waybeo" && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Waybeo Payload Template</h2>
              <p className="mt-1 text-sm text-slate-500">
                JSON structure for Waybeo callback payload. Use same placeholders as SI template.
              </p>
            </div>
            <Button variant="secondary" onClick={resetWaybeoTemplate} className="text-xs">
              Reset to Default
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Additional Placeholders</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-amber-700">
              <code>{"{transcript_text}"}</code>
              <code>{"{transcript_json}"}</code>
              <code>{"{analytics.total_exchanges}"}</code>
              <code>{"{analytics.user_messages}"}</code>
              <code>{"{analytics.assistant_messages}"}</code>
              <code>{"{waybeo_header.*}"}</code>
            </div>
          </div>

          <div>
            <Textarea
              value={waybeoPayloadTemplate}
              onChange={(e) => setWaybeoPayloadTemplate(e.target.value)}
              rows={25}
              placeholder="Enter Waybeo payload JSON template..."
              className="font-mono text-xs leading-relaxed"
            />
          </div>
        </Card>
      )}

      {/* Save Button - Always visible */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg sticky bottom-4">
        <div>
          {saved && (
            <span className="text-sm text-emerald-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
