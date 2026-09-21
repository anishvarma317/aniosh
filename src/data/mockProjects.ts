import { ClientProject, UserWorkflowPreferences } from '../types';

export const INITIAL_PREFERENCES: UserWorkflowPreferences = {
  studioName: 'THS Post-Production Cinema',
  editorName: 'Post-Production Lead',
  defaultFollowUpIntervalDays: 2,
  autoEscalateOverdueDays: 1,
  enableInAppPopupAlerts: true,
  logoText: 'THS',
  studioLogoUrl: ''
};

export const INITIAL_PROJECTS: ClientProject[] = [
  {
    id: 'proj-prashant-sally',
    coupleNames: 'Prashant & Sally',
    weddingDate: '2026-08-15',
    contactPerson: 'Prashant',
    clientPhone: '+919876543210',
    clientEmail: 'prashant.sally@gmail.com',
    pendingWorks: ['album_pending'],
    coordinationNeed: 'Review 50-page wedding album layout proof & approve for printing',
    draftReviewLink: 'https://albumdraft.com/review/prashant-sally',
    clientPromisedDate: '2026-09-20', // TODAY! Exact date client provided
    status: 'date_due_today',
    nextFollowUpDate: '2026-09-20',
    totalFollowUpsSent: 1,
    notes: 'Prashant promised he and Sally would review the album spreads over the weekend and give final confirmation by Sept 20.',
    logs: [
      {
        id: 'log-p1',
        timestamp: '2026-09-16T11:00:00Z',
        channel: 'WhatsApp',
        actionTaken: 'Sent digital album layout proof link on WhatsApp',
        clientResponse: 'Prashant: "Spreads look stunning! Sally and I will review together and update you by Sunday 20th without fail."',
        newPromisedDate: '2026-09-20',
        nextReminderDate: '2026-09-20'
      }
    ],
    createdAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'proj-rahul-ananya',
    coupleNames: 'Rahul & Ananya',
    weddingDate: '2026-08-12',
    contactPerson: 'Rahul',
    clientPhone: '+919822334455',
    clientEmail: 'rahul.ananya@gmail.com',
    pendingWorks: ['video_changes', 'payment_pending'],
    coordinationNeed: 'Send song replacements / timecode cuts for highlight film & clear balance payment',
    draftReviewLink: 'https://frame.io/review/rahul-ananya-cut',
    clientPromisedDate: '2026-09-18', // 2 days overdue! Keeps reminding until updated in app
    status: 'date_overdue',
    nextFollowUpDate: '2026-09-20',
    totalFollowUpsSent: 2,
    notes: 'Rahul promised to send cut notes and payment by Sept 18th. Overdue by 2 days—still pending update!',
    logs: [
      {
        id: 'log-r1',
        timestamp: '2026-09-14T10:00:00Z',
        channel: 'WhatsApp',
        actionTaken: 'Sent rough cut review link on Frame.io',
        clientResponse: 'Rahul: "Will send song change list and payment by Friday 18th"',
        newPromisedDate: '2026-09-18',
        nextReminderDate: '2026-09-18'
      },
      {
        id: 'log-r2',
        timestamp: '2026-09-19T14:30:00Z',
        channel: 'WhatsApp',
        actionTaken: 'Followed up on WhatsApp as Sept 18 passed without update',
        clientResponse: 'No response yet',
        nextReminderDate: '2026-09-20'
      }
    ],
    createdAt: '2026-09-14T09:00:00Z'
  },
  {
    id: 'proj-samarth-tanvi',
    coupleNames: 'Samarth & Tanvi',
    weddingDate: '2026-08-28',
    contactPerson: 'Tanvi',
    clientPhone: '+1 (555) 345-6789',
    clientEmail: 'tanvi.samarth@gmail.com',
    pendingWorks: ['selection_pending'],
    coordinationNeed: 'Client to complete selection of 150 favorite photos from raw cloud gallery',
    draftReviewLink: 'https://gallery.weddingstudio.com/tanvi-samarth/selection',
    clientPromisedDate: '2026-09-22', // Coming up in 2 days
    status: 'date_promised_active',
    nextFollowUpDate: '2026-09-22',
    totalFollowUpsSent: 1,
    notes: 'Tanvi opened the selection gallery; mentioned she will complete selections by Tuesday 22nd.',
    logs: [
      {
        id: 'log-s1',
        timestamp: '2026-09-15T09:30:00Z',
        channel: 'WhatsApp',
        actionTaken: 'Shared online photo selection portal link',
        clientResponse: 'Tanvi: "Started shortlisting, will finish and submit by Sept 22nd"',
        newPromisedDate: '2026-09-22',
        nextReminderDate: '2026-09-22'
      }
    ],
    createdAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'proj-kabir-rhea',
    coupleNames: 'Kabir & Rhea',
    weddingDate: '2026-07-20',
    contactPerson: 'Kabir',
    clientPhone: '+919988771122',
    clientEmail: 'kabir.rhea@outlook.com',
    pendingWorks: ['album_pending', 'video_changes', 'payment_pending'],
    coordinationNeed: 'Approve final album cover lettering, confirm teaser song choice, and process milestone',
    draftReviewLink: 'https://vimeo.com/private/kabir-rhea',
    clientPromisedDate: '2026-09-24',
    status: 'date_promised_active',
    nextFollowUpDate: '2026-09-24',
    totalFollowUpsSent: 1,
    notes: 'Kabir promised to coordinate with Rhea on both album and teaser song by Thursday the 24th.',
    logs: [
      {
        id: 'log-k1',
        timestamp: '2026-09-17T11:00:00Z',
        channel: 'WhatsApp',
        actionTaken: 'Sent teaser draft + album cover proof',
        clientResponse: 'Kabir: "Looks great, will finalize both with Rhea by 24th Sept"',
        newPromisedDate: '2026-09-24',
        nextReminderDate: '2026-09-24'
      }
    ],
    createdAt: '2026-09-17T10:00:00Z'
  }
];
