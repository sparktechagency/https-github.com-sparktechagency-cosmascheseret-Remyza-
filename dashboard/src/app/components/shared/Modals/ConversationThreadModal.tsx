"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Phone, User2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, formatDate } from "@/lib/api";
import type { AdminConversationMessage, AdminMessageParty, ApiEnvelope } from "@/types/admin";

interface ConversationData {
  conversation_id: number;
  chesera_user: AdminMessageParty;
  receiver: AdminMessageParty;
  total_messages: number;
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminConversationMessage[];
}

interface Props { isOpen: boolean; onClose: () => void; onViewUser?: () => void; conversationId?: number | null; }

export function ConversationThreadModal({ isOpen, onClose, onViewUser, conversationId }: Props) {
  const [data, setData] = useState<ConversationData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!isOpen || !conversationId) return;
    setLoading(true);
    try {
      const response = await apiRequest<ApiEnvelope<ConversationData>>(`admin/conversations/${conversationId}/messages/?page=${page}&page_size=20`);
      setData(response.data);
    } finally { setLoading(false); }
  }, [conversationId, isOpen, page]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (isOpen) setPage(1); }, [isOpen, conversationId]);

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="p-0 gap-0 w-[calc(100%-2rem)] sm:max-w-2xl max-h-[92vh] flex flex-col rounded-[24px] overflow-hidden">
      <div className="px-6 py-4 border-b"><DialogTitle className="text-[17px] font-bold">Conversation Thread</DialogTitle></div>
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b">
        <Party party={data?.receiver} icon={<Phone className="h-4 w-4" />} />
        <div className="text-right"><p className="text-xs font-bold">{data?.chesera_user.name || "Chesera user"}</p><p className="text-[11px] text-slate-400">{data?.chesera_user.phone || ""}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-80">
        {loading && <p className="text-sm text-slate-400">Loading conversation...</p>}
        {!loading && !data?.results.length && <p className="text-sm text-slate-400">No messages found.</p>}
        {data?.results.map((message) => {
          const outgoing = message.direction.toLowerCase() === "sent";
          const status = typeof message.status === "string" ? message.status : String(message.status?.status || "");
          return <div key={message.id} className={`max-w-[85%] ${outgoing ? "ml-auto text-right" : ""}`}>
            <p className="mb-1 text-[11px] font-bold text-slate-400">{message.sender.name || (outgoing ? data.chesera_user.name : data.receiver.name)}</p>
            <div className={`rounded-2xl p-3.5 text-left text-sm ${outgoing ? "border bg-white rounded-tr-sm" : "bg-slate-100 rounded-tl-sm"}`}>{message.message}</div>
            <p className="mt-1 text-[10px] text-slate-400">{formatDate(message.timestamp)}{status ? ` · ${status}` : ""}</p>
          </div>;
        })}
      </div>
      <div className="px-6 py-3 border-t flex items-center justify-between text-xs">
        <span><b>{data?.total_messages || 0}</b> total messages</span>
        <div className="flex gap-2"><button disabled={!data?.previous || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Previous</button><button disabled={!data?.next || loading} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Next</button></div>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t flex justify-between">
        <button onClick={onViewUser} className="flex items-center gap-1.5 text-xs font-bold text-[#0052CC]"><User2 className="h-3.5 w-3.5" /> View User</button>
        <DialogClose asChild><button className="px-5 py-2 bg-[#0052CC] text-white font-bold text-xs rounded-xl">Close</button></DialogClose>
      </div>
    </DialogContent>
  </Dialog>;
}

function Party({ party, icon }: { party?: AdminMessageParty; icon: ReactNode }) { return <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">{icon}</div><div><p className="text-sm font-bold">{party?.name || "Unknown contact"}</p><p className="text-[11px] text-slate-400">{party?.phone || "—"}</p></div></div>; }
