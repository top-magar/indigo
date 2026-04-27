"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, MessageCircle, Send, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { type WhatsAppSettings, updateWhatsAppSettings, sendTestWhatsAppMessage } from "./actions";

function SecretInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pr-9" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

export function WhatsAppSettingsClient({ initialSettings }: { initialSettings: WhatsAppSettings }) {
  const [s, setS] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);
  const set = <K extends keyof WhatsAppSettings>(k: K, v: WhatsAppSettings[K]) => setS(prev => ({ ...prev, [k]: v }));
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initialSettings);
  useUnsavedChanges(hasChanges);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateWhatsAppSettings(s);
      result.success ? toast.success("WhatsApp settings saved") : toast.error(result.error ?? "Failed to save");
    });
  };

  const handleTest = async () => {
    setIsTesting(true);
    const result = await sendTestWhatsAppMessage(s);
    result.success ? toast.success("Test message sent!") : toast.error(result.error ?? "Failed to send test message");
    setIsTesting(false);
  };

  useSaveShortcut(handleSave);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">WhatsApp Notifications</h1>
          <p className="text-xs text-muted-foreground">Send order alerts to your WhatsApp number</p>
        </div>
        <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        <div className="flex items-center gap-3 p-4">
          <div className="size-10 rounded-lg border bg-background flex items-center justify-center shrink-0">
            <MessageCircle className="size-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">WhatsApp Business API</p>
              <Badge className={`text-[10px] px-1.5 py-0 ${s.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {s.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Works with Twilio, WATI, or direct WhatsApp Business API</p>
          </div>
          <Switch checked={s.enabled} onCheckedChange={v => set("enabled", v)} />
        </div>

        {s.enabled && (
          <div className="p-4 ml-[52px] space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">API URL</Label>
                <Input value={s.apiUrl} onChange={e => set("apiUrl", e.target.value)} placeholder="https://api.provider.com/v1/messages" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">API Token</Label>
                <SecretInput id="whatsappToken" value={s.apiToken} onChange={v => set("apiToken", v)} placeholder="Your API token" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Merchant Phone</Label>
                <Input value={s.merchantPhone} onChange={e => set("merchantPhone", e.target.value)} placeholder="+977 98XXXXXXXX" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting || !s.apiUrl || !s.apiToken || !s.merchantPhone}>
              {isTesting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              {isTesting ? "Sending…" : "Send Test Message"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
