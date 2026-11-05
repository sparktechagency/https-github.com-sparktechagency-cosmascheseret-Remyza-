"use client";

import { useState } from "react";
import LegalRichTextEditor from "./LegalRichTextEditor";

interface LegalDocumentSettingsProps {
  title: string;
  description: string;
  initialContent: string;
}

export default function LegalDocumentSettings({ title, description, initialContent }: LegalDocumentSettingsProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaved, setIsSaved] = useState(false);

  const saveDocument = () => {
    // This HTML is ready to map directly to the CKEditor 5 field sent to Django.
    console.log(`Saved ${title}:`, content);
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        </div>
        <button type="button" onClick={saveDocument} className="rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003D99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]">Save changes</button>
      </header>
      <div className="p-5 sm:p-6">
        <LegalRichTextEditor value={content} onChange={setContent} />
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-[#00A86B]">{isSaved ? `${title} saved.` : ""}</p>
      </div>
    </section>
  );
}
