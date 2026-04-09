"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityFormCard } from "@/components/dashboard/templates";
import { updateStorefrontSettings, type StorefrontSettings } from "./actions";

const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube", "twitter"] as const;

interface StorefrontSettingsClientProps {
  initialSettings: StorefrontSettings;
}

export function StorefrontSettingsClient({ initialSettings }: StorefrontSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [announcementBar, setAnnouncementBar] = useState(initialSettings.announcementBar);
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail);
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone);
  const [footerText, setFooterText] = useState(initialSettings.footerText);
  const [socialLinks, setSocialLinks] = useState(initialSettings.socialLinks);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "facebook", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    setSocialLinks(socialLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.set("announcementBar", announcementBar);
    formData.set("contactEmail", contactEmail);
    formData.set("contactPhone", contactPhone);
    formData.set("footerText", footerText);
    formData.set("socialLinks", JSON.stringify(socialLinks));

    startTransition(async () => {
      const result = await updateStorefrontSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Storefront settings saved");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-3">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.4px]">Storefront</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your public storefront appearance and contact info.
        </p>
      </div>

      <EntityFormCard title="Announcement Bar" description="Displayed at the top of your store">
        <div className="space-y-2">
          <Label htmlFor="announcementBar">Message</Label>
          <Input
            id="announcementBar"
            value={announcementBar}
            onChange={(e) => setAnnouncementBar(e.target.value)}
            placeholder="Free shipping on orders over $50!"
            maxLength={200}
          />
        </div>
      </EntityFormCard>

      <EntityFormCard title="Contact Information" description="Shown on your storefront">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </EntityFormCard>

      <EntityFormCard title="Footer" description="Text shown in the store footer">
        <div className="space-y-2">
          <Label htmlFor="footerText">Footer Text</Label>
          <Textarea
            id="footerText"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="© 2024 Your Store. All rights reserved."
            rows={3}
            maxLength={500}
          />
        </div>
      </EntityFormCard>

      <EntityFormCard
        title="Social Links"
        description="Links to your social media profiles"
        actions={
          <Button variant="outline" size="sm" onClick={addSocialLink}>
            <Plus className="size-4 mr-1" /> Add
          </Button>
        }
      >
        {socialLinks.length === 0 && (
          <p className="text-sm text-muted-foreground">No social links added yet.</p>
        )}
        {socialLinks.map((link, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="w-40">
              <Label className="sr-only">Platform</Label>
              <Select
                value={link.platform}
                onValueChange={(v) => updateSocialLink(index, "platform", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="sr-only">URL</Label>
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                placeholder="https://"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </EntityFormCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
