"use client";

import React, { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

// Importing your custom data table component

interface MessageLogItem {
  id: string; // Used by your DataTable map keys
  user: string;
  contactName: string;
  contactPhone: string;
  preview: string;
  direction: "Sent" | "Received";
  status: "Delivered" | "Failed";
  timestamp: string;
  isActive?: boolean; // Required by your DataTable generic constraints
}

const INITIAL_MOCK_LOGS: MessageLogItem[] = [
  {
    id: "MSG-9821",
    user: "Alex Johnson",
    contactName: "Chris Evans",
    contactPhone: "+1 (555) 321-0987",
    preview: "Hi! I noticed you were looking at homes in the downtown area. Would you like to schedule a quick tour this weekend?",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 10:23 AM",
    isActive: true
  },
  {
    id: "MSG-9820",
    user: "Sarah Jenkins",
    contactName: "Jessica Alba",
    contactPhone: "+1 (555) 871-4421",
    preview: "Thanks for the details! What is the minimum down payment required for the second property listed?",
    direction: "Received",
    status: "Delivered",
    timestamp: "May 12, 2026 10:15 AM",
    isActive: true
  },
  {
    id: "MSG-9819",
    user: "Alex Johnson",
    contactName: "Michael B.",
    contactPhone: "+1 (555) 902-1182",
    preview: "Your automated valuation report is ready. Click the link to review your custom equity breakdown path.",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 09:44 AM",
    isActive: true
  },
  {
    id: "MSG-9818",
    user: "David Miller",
    contactName: "Robert Downey",
    contactPhone: "+1 (555) 234-5678",
    preview: "Failed to establish a primary connection handshake with the local carrier gateway. Retrying drop sequence.",
    direction: "Sent",
    status: "Failed",
    timestamp: "May 12, 2026 09:12 AM",
    isActive: false
  },
  {
    id: "MSG-9817",
    user: "Sarah Jenkins",
    contactName: "Emma Watson",
    contactPhone: "+1 (555) 765-4321",
    preview: "Perfect, let's lock in the Tuesday slot at 3 PM. Sending over the digital calendar invite links now.",
    direction: "Sent",
    status: "Delivered",
    timestamp: "May 12, 2026 08:55 AM",
    isActive: true
  }
];