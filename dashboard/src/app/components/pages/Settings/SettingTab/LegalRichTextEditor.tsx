"use client";

import dynamic from "next/dynamic";

const LegalRichTextEditor = dynamic(() => import("./LegalRichTextEditorClient"), {
  ssr: false,
  loading: () => <div className="min-h-[360px] animate-pulse rounded-xl border border-slate-200 bg-slate-50" aria-label="Loading editor" />,
});

export default LegalRichTextEditor;
