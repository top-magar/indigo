"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

const PDFS = {
  en: { src: "/legal/e-commerce-act-2081-en.pdf", label: "English", title: "E-Commerce Act, 2081" },
  np: { src: "/legal/e-commerce-act-2081-np.pdf", label: "नेपाली", title: "विद्युतीय व्यापार ऐन, २०८१" },
};

export function ECommerceActLink() {
  const [lang, setLang] = useState<"en" | "np">("en");
  const pdf = PDFS[lang];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="underline hover:no-underline font-medium text-foreground">
          Nepal's E-Commerce Act 2081
        </button>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 border-0 max-w-[calc(100vw-2rem)] w-full h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-xl">
        <DialogTitle className="sr-only">{pdf.title}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">{pdf.title}</p>
            <div className="flex rounded-md border overflow-hidden">
              {(["en", "np"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs transition-colors ${lang === l ? "bg-foreground text-background" : "hover:bg-muted"}`}
                >
                  {PDFS[l].label}
                </button>
              ))}
            </div>
          </div>
          <a href={pdf.src} download className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="size-3.5" /> Download
          </a>
        </div>

        {/* PDF */}
        <iframe src={pdf.src} className="flex-1 w-full" title={pdf.title} />
      </DialogContent>
    </Dialog>
  );
}
