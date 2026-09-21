export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type PendingWorkCategory = 
  | 'album_pending'       // Album Pending (approval, layout notes)
  | 'selection_pending'   // Selection Pending (photo / video raw selection)
  | 'payment_pending'     // Payment Pending (balance or milestone)
  | 'video_changes';      // Video Changes Pending (song changes, timecodes)

export const PENDING_WORK_CONFIG: Record<PendingWorkCategory, {
  id: PendingWorkCategory;
  label: string;
  description: string;
  badgeClass: string;
  color: string;
}> = {
  album_pending: {
    id: 'album_pending',
    label: 'Album Pending',
    description: 'Album layout design approval or photo swaps',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    color: '#4f46e5'
  },
  selection_pending: {
    id: 'selection_pending',
    label: 'Selection Pending',
    description: 'Client needs to select favorite photos or raw footage',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    color: '#7e22ce'
  },
  payment_pending: {
    id: 'payment_pending',
    label: 'Payment Pending',
    description: 'Milestone installment or final balance payment',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: '#059669'
  },
  video_changes: {
    id: 'video_changes',
    label: 'Video Changes Pending',
    description: 'Song changes, cut timecodes, or edit revision notes',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    color: '#d97706'
  },
};

export type CoordinationStatus = 
  | 'awaiting_client_date'    // We are waiting for the client to give us a date
  | 'date_promised_active'    // Client provided a date; countdown active
  | 'date_due_today'          // Exact date provided by client has arrived! Send message today
  | 'date_overdue'            // Client's promised date passed, still pending update! Keep reminding
  | 'resolved'                // Client sent the update / work cleared
  | 'delivered';              // Project delivered & archived

export interface CoordinationLog {
  id: string;
  timestamp: string; // ISO date string
  channel: 'WhatsApp' | 'Phone Call' | 'Email';
  actionTaken: string; // e.g. "Sent WhatsApp check-in for Album Pending"
  clientResponse?: string; // e.g. "Replied: 'Will finish selecting tonight'"
  newPromisedDate?: string; // If client provided a new date
  nextReminderDate: string; // YYYY-MM-DD
}

export interface ClientProject {
  id: string;
  coupleNames: string; // e.g. "Prashant & Sally"
  weddingDate?: string; // YYYY-MM-DD
  contactPerson: string; // e.g. "Prashant", "Sally", or "Client"
  clientPhone: string; // WhatsApp phone number
  clientEmail?: string;
  
  // 2-3 Pending Works Multi-Selection
  pendingWorks: PendingWorkCategory[];
  
  // Specific notes or details on what is needed
  coordinationNeed?: string;
  
  // Optional preview link for draft or album proofing
  draftReviewLink?: string;
  
  // THE DATE CLIENT PROVIDED
  clientPromisedDate: string; // YYYY-MM-DD - The exact date client provided to update
  
  // Status & Reminder Tracking
  status: CoordinationStatus;
  lastPingDate?: string; // Last time WhatsApp message was sent
  nextFollowUpDate: string; // YYYY-MM-DD
  totalFollowUpsSent: number;
  notes?: string;
  
  logs: CoordinationLog[];
  createdAt: string;
}

export interface UserWorkflowPreferences {
  studioName: string;
  editorName: string;
  defaultFollowUpIntervalDays: number;
  autoEscalateOverdueDays: number;
  enableInAppPopupAlerts?: boolean; // In-app popup notification toggle
  studioLogoUrl?: string; // Base64 data URL or external image URL
  logoText?: string; // Custom initials or brand text (e.g. "THS")
}
