"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ECommerceActLink() {
  const [lang, setLang] = useState<"en" | "np">("en");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="underline hover:no-underline font-medium text-foreground">
          Nepal's E-Commerce Act 2081
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>E-Commerce Act, 2081</DialogTitle>
            <div className="flex gap-1">
              <Button variant={lang === "en" ? "default" : "outline"} size="sm" onClick={() => setLang("en")}>English</Button>
              <Button variant={lang === "np" ? "default" : "outline"} size="sm" onClick={() => setLang("np")}>नेपाली</Button>
            </div>
          </div>
        </DialogHeader>
        <iframe
          src={lang === "en" ? "/legal/e-commerce-act-2081-en.pdf" : "/legal/e-commerce-act-2081-np.pdf"}
          className="w-full flex-1 rounded-md border"
          title={lang === "en" ? "E-Commerce Act 2081 (English)" : "विद्युतीय व्यापार ऐन, २०८१ (नेपाली)"}
        />
      </DialogContent>
    </Dialog>
  );
}
