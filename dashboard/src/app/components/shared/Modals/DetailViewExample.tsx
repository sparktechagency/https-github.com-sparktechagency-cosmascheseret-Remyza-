"use client";

import type { ReactNode } from "react";
import { MessageSquare, User } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/api";
import type { AdminMessageDetail } from "@/types/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onViewUser: () => void;
  onViewConversation: () => void;
  data?: AdminMessageDetail | null;
  loading?: boolean;
}

export function DetailViewExample({ isOpen, onClose, onViewUser, onViewConversation, data, loading }: Props) {
  const metadata = data ? Object.entries(data.metadata || {}) : [];
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 w-[calc(100%-2rem)] sm:max-w-150 rounded-[28px] overflow-hidden">
        <div className="px-6 py-5 border-b"><DialogTitle className="text-[17px] font-bold">Message Details</DialogTitle></div>
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading && <p className="text-sm text-slate-400">Loading message details...</p>}
          {!loading && data && <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Party label="From" name={data.from_user.name} phone={data.from_user.phone} />
              <Party label="To" name={data.to.name} phone={data.to.phone} />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <Badge value={data.channel || "unknown"} color="purple" />
              <Badge value={data.status} color={data.status.toLowerCase() === "failed" ? "red" : "green"} />
              <Badge value={data.direction} color="blue" />
            </div>
            <Info label="Timestamp" value={formatDate(data.timestamp)} />
            <div>
              <Label>Message Content</Label>
              <div className="mt-2 rounded-2xl border bg-slate-50 p-4 text-sm leading-relaxed">{data.content || data.message}</div>
            </div>
            <div>
              <Label>Metadata</Label>
              <div className="mt-2 space-y-2 text-xs">
                <Info label="Sent.dm message ID" value={data.sent_message_id || "—"} />
                <Info label="Conversation ID" value={data.conversation_id?.toString() || "—"} />
                {metadata.map(([key, value]) => <Info key={key} label={key.replaceAll("_", " ")} value={typeof value === "object" ? JSON.stringify(value) : String(value)} />)}
              </div>
            </div>
          </>}
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="flex gap-4 text-xs font-bold text-[#004BCE]">
            <button onClick={onViewUser} className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> View User</button>
            <button onClick={onViewConversation} disabled={!data?.conversation_id} className="inline-flex items-center gap-1 disabled:opacity-40"><MessageSquare className="h-3.5 w-3.5" /> View Conversation</button>
          </div>
          <DialogClose asChild><button className="px-5 py-2.5 border rounded-xl text-xs font-bold">Close</button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: ReactNode }) { return <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{children}</span>; }
function Party({ label, name, phone }: { label: string; name: string; phone: string }) { return <div><Label>{label}</Label><p className="mt-2 text-sm font-bold">{name || "Unknown"}</p><p className="text-xs text-slate-400">{phone || "—"}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><span className="text-slate-400 capitalize">{label}</span><span className="text-right font-medium break-all">{value}</span></div>; }
function Badge({ value, color }: { value: string; color: "purple" | "red" | "green" | "blue" }) { const colors = { purple: "bg-purple-50 text-purple-600", red: "bg-rose-50 text-rose-600", green: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600" }; return <span className={`rounded-xl px-3 py-1.5 capitalize ${colors[color]}`}>{value}</span>; }
