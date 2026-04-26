"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PDF_URL = "https://giwmscdnone.gov.np/media/files/E-Commerce%20Act%2C%202081_yr7k9o5.pdf";

export function ECommerceActLink() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="underline hover:no-underline font-medium text-foreground">
          Nepal's E-Commerce Act 2081
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>E-Commerce Act, 2081 (2025)</DialogTitle>
        </DialogHeader>
        <iframe src={PDF_URL} className="w-full flex-1 rounded-md border" title="E-Commerce Act 2081 PDF" />
      </DialogContent>
    </Dialog>
  );
}
