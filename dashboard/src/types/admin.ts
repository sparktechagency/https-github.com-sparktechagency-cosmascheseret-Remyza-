export interface AdminUserSummary {
  total_users: number;
  total_active: number;
  total_blocked: number;
  total_on_trial: number;
}

export interface AdminUserListItem {
  id: number;
  user_id: number;
  user_name: string;
  business_name: string | null;
  profile_pic: string | null;
  email: string | null;
  phone: string;
  plan: "pro" | "trial" | "free" | string;
  messages_sent_count: number;
  leads_count: number;
  is_active: boolean;
  joined_date: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  full_name: string;
  phone_number: string;
  city: string;
  country: string;
  country_code: string;
  timezone: string;
  profile_picture: string | null;
  user_type: string;
  is_phone_verified: boolean;
  status: string;
  days_active: number;
  response_rate: number;
  business_type: string;
  chesera_number: string;
  last_active: string;
  last_activity_at: string | null;
  organization: { id: number; name: string; email: string; website: string; country: string; business_type: string; is_onboarding_completed: boolean } | null;
  subscription: { id: number; plan: string; price: string; plan_type: string | null; product_id: string; status: string; is_active: boolean; medium: string; start_date: string | null; next_renewal: string | null; purchase_date: string | null; expiry_date: string | null } | null;
}

export interface AdminMessageParty {
  id: number | null;
  name: string;
  phone: string;
  profile_pic?: string | null;
  is_chesera_user?: boolean;
}

export interface AdminMessageListItem {
  id: number;
  user: AdminMessageParty;
  contact: AdminMessageParty;
  receiver: AdminMessageParty;
  message: string;
  status: string;
  direction: string;
  timestamp: string;
  conversation_id: number | null;
}

export interface AdminMessageDetail extends AdminMessageListItem {
  from_user: AdminMessageParty;
  to: AdminMessageParty;
  content: string;
  metadata: Record<string, unknown>;
  channel: string;
  sent_message_id: string;
}

export interface AdminConversationMessage {
  id: number;
  sender: AdminMessageParty;
  receiver: AdminMessageParty;
  message: string;
  timestamp: string;
  status: Record<string, unknown> | string;
  direction: string;
  metadata: Record<string, unknown>;
}

export interface AdminRevenueAnalytics {
  period: string;
  start_date: string;
  end_date: string;
  summary: Record<string, { value: number | string; change_percent: number }>;
  message_volume_analytics: Array<{ label: string; message_volume: number }>;
  subscribers: Array<{ label: string; count: number; percent: number }>;
  leads: Array<{ label: string; count: number; percent: number; change_percent?: number }>;
}

export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
