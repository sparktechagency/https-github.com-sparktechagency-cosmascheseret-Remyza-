"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const initialFaqs: FaqItem[] = [
  { id: "faq-1", question: "How does AI auto-reply work?", answer: "Chesera analyzes incoming messages and generates helpful, human-like responses based on the lead’s intent and level of interest. It helps your team engage faster and follow up consistently." },
  { id: "faq-2", question: "How do I import contacts from a CSV file?", answer: "Upload a CSV file from the Leads section, review the imported contact details, and confirm the import. Chesera will organize those contacts for engagement." },
  { id: "faq-3", question: "What is a Hot Lead versus a Cold Lead?", answer: "A Hot Lead shows strong interest and intent, while a Cold Lead has little or no engagement. Chesera can categorize leads from their conversation behavior and responses." },
  { id: "faq-4", question: "Can I change my Chesera SMS number?", answer: "Depending on your plan and availability, you can request a new dedicated Chesera number through account settings or admin support." },
];

const emptyForm = { question: "", answer: "" };

export default function FaqSettings(): React.JSX.Element {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [openFaqId, setOpenFaqId] = useState<string | null>(initialFaqs[0].id);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAddForm = () => {
    setEditingFaq(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (faq: FaqItem) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingFaq(null);
    setForm(emptyForm);
  };

  const saveFaq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = form.question.trim();
    const answer = form.answer.trim();
    if (!question || !answer) return;

    if (editingFaq) {
      setFaqs((current) => current.map((faq) => faq.id === editingFaq.id ? { ...faq, question, answer } : faq));
    } else {
      const newFaq = { id: `faq-${Date.now()}`, question, answer };
      setFaqs((current) => [...current, newFaq]);
      setOpenFaqId(newFaq.id);
    }
    closeForm();
  };

  const deleteFaq = (id: string) => {
    setFaqs((current) => current.filter((faq) => faq.id !== id));
    if (openFaqId === id) setOpenFaqId(null);
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
          <p className="mt-1 text-sm text-[#64748B]">Create and manage the answers shown to your users.</p>
        </div>
        <button type="button" onClick={openAddForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003D99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052CC]">
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </header>

      <div className="space-y-3 p-5 sm:p-6">
        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
            <p className="font-medium text-[#475569]">No FAQs yet</p>
            <p className="mt-1 text-sm text-[#94A3B8]">Add a question and answer to get started.</p>
          </div>
        ) : faqs.map((faq, index) => {
          const isOpen = openFaqId === faq.id;
          return <article key={faq.id} className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 bg-white px-4 py-3 sm:px-5">
              <button type="button" onClick={() => setOpenFaqId(isOpen ? null : faq.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={isOpen}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-semibold text-[#2563EB]">{index + 1}</span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold text-[#0F172A]">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => openEditForm(faq)} aria-label={`Edit ${faq.question}`} className="rounded-lg p-2 text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => deleteFaq(faq.id)} aria-label={`Delete ${faq.question}`} className="rounded-lg p-2 text-[#64748B] hover:bg-[#FFF1F2] hover:text-[#E11D48]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {isOpen && <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 text-sm leading-6 text-[#475569]">{faq.answer}</div>}
          </article>;
        })}
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-32px)] max-w-[560px] gap-0 rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] sm:max-w-[560px]">
          <form onSubmit={saveFaq}>
            <div className="flex items-start border-b border-slate-100 px-5 py-5 sm:px-6">
              <div><DialogTitle className="text-lg font-semibold text-[#0F172A]">{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle><DialogDescription className="mt-1 text-sm text-[#64748B]">Enter the question and its answer for users to view.</DialogDescription></div>
              <button type="button" onClick={closeForm} aria-label="Close FAQ form" className="ml-auto text-[#94A3B8] hover:text-[#475569]"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-6">
              <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">Question</span><input autoFocus value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} placeholder="e.g. How does billing work?" className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" required /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">Answer</span><textarea value={form.answer} onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))} placeholder="Write a clear answer for users…" rows={6} className="w-full resize-y rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm leading-6 text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-2 focus:ring-[#DBEAFE]" required /></label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6"><button type="button" onClick={closeForm} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003D99]">{editingFaq ? "Save changes" : "Add FAQ"}</button></div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
