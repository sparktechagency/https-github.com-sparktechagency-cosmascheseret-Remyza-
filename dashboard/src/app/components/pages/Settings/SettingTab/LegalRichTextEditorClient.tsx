"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

interface LegalRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LegalRichTextEditorClient({ value, onChange }: LegalRichTextEditorProps) {
  return (
    <div className="legal-rich-text-editor overflow-hidden rounded-xl border border-slate-200 bg-white">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: "GPL",
          plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote, Undo],
          toolbar: ["undo", "redo", "|", "heading", "|", "bold", "italic", "underline", "link", "|", "bulletedList", "numberedList", "|", "blockQuote"],
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
