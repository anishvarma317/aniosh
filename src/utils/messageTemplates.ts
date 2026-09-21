import { ClientProject, PENDING_WORK_CONFIG, PendingWorkCategory } from '../types';
import { formatDateString, getDaysDifference, TODAY_STR } from './dateUtils';

export interface GeneratedTemplate {
  id: string;
  title: string;
  tone: string;
  body: string;
}

export function formatPendingWorksList(pendingWorks: PendingWorkCategory[]): string {
  if (!pendingWorks || pendingWorks.length === 0) return 'pending wedding deliverables';
  const labels = pendingWorks.map(pw => PENDING_WORK_CONFIG[pw]?.label || pw);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}

export function generateWeddingWhatsAppMessages(project: ClientProject): GeneratedTemplate[] {
  const contactName = project.contactPerson || project.coupleNames.split('&')?.[0]?.trim() || 'there';
  const promisedDateStr = project.clientPromisedDate ? formatDateString(project.clientPromisedDate) : '';
  const daysDiff = project.clientPromisedDate ? getDaysDifference(project.clientPromisedDate, TODAY_STR) : 0;
  const isOverdue = daysDiff < 0;
  const isToday = daysDiff === 0;

  const pendingText = formatPendingWorksList(project.pendingWorks);
  const specificNeed = project.coordinationNeed ? ` (${project.coordinationNeed})` : '';

  const templates: GeneratedTemplate[] = [];

  // 1. Exact Date Reminder (Tailored for Today or Overdue)
  if (isToday) {
    templates.push({
      id: 'exact-date-today',
      title: 'Due Today Reminder',
      tone: 'Polite & Timely (Exact Date)',
      body: `Hi ${contactName}! Hope you're having a great day 😊

Gentle reminder as discussed—you had mentioned you would update us regarding your ${pendingText}${specificNeed} by today (${promisedDateStr}).

Just touching base to check if you had a chance to finalize those? Please let us know so we can update our schedule and keep everything moving smoothly! ✨`
    });
  } else if (isOverdue) {
    const overdueDays = Math.abs(daysDiff);
    templates.push({
      id: 'overdue-reminder',
      title: `Overdue Follow-up (${overdueDays}d past client date)`,
      tone: 'Persistent & Gentle (Until Updated)',
      body: `Hi ${contactName}, hope you are doing well! 

Following up regarding your ${pendingText}${specificNeed}. You had mentioned you would be able to share the updates by ${promisedDateStr}. 

We haven't received them yet, so just checking in to see if you need any help or if you can share the updates today? If you need more time, please let us know a revised date so we can note it down. Thank you! 🙏`
    });
  } else if (project.clientPromisedDate) {
    templates.push({
      id: 'upcoming-date-nudge',
      title: `Upcoming Date Reminder (${daysDiff}d to go)`,
      tone: 'Friendly Pre-Check',
      body: `Hi ${contactName}! Hope you and the family are having a wonderful week ✨

Just a quick touch-point from our post-production team regarding your ${pendingText}${specificNeed}. As agreed, we're expecting your update by ${promisedDateStr}. 

Please feel free to reach out if you have any questions or need anything from our end before then! 🎬`
    });
  } else {
    // No date set yet
    templates.push({
      id: 'ask-for-date',
      title: 'Ask Client for Confirmed Date',
      tone: 'Friendly & Direct',
      body: `Hi ${contactName}! Hope you're doing well ✨

Reaching out from the post-production studio regarding your ${pendingText}${specificNeed}. 

Could you please let us know by what date you will be able to share your update? Once you give us a confirmed date, we can plan our workflow accordingly. Looking forward to hearing from you! 😊`
    });
  }

  // 2. Focused Category-specific template
  if (project.pendingWorks.includes('album_pending')) {
    templates.push({
      id: 'album-specific',
      title: 'Album Pending Specific Follow-up',
      tone: 'Album Design & Print Focus',
      body: `Hi ${contactName}! Checking in regarding your wedding photo album design. 

Have you had an opportunity to review the layout proof or select your favorite photos? Once you send over your confirmation or swaps, we can send the album to the print lab right away. Please let us know when you can share this! 📖✨`
    });
  }

  if (project.pendingWorks.includes('selection_pending')) {
    templates.push({
      id: 'selection-specific',
      title: 'Selection Pending Specific Follow-up',
      tone: 'Photo/Video Selection',
      body: `Hi ${contactName}! Just checking in regarding your photo/video selection. 

Have you had a chance to mark your shortlisted favorites? Let us know if you need any assistance with the selection gallery link or if you have a target date to complete it! 📸`
    });
  }

  if (project.pendingWorks.includes('video_changes')) {
    templates.push({
      id: 'video-specific',
      title: 'Video Changes Specific Follow-up',
      tone: 'Edit Suite Revision Focus',
      body: `Hi ${contactName}! Checking in from the video editing suite regarding your wedding film draft. 

Have you both had time to watch through the edit and note any cut changes or song preferences? Our editing team is ready to apply your revisions as soon as you share them! 🎬`
    });
  }

  if (project.pendingWorks.includes('payment_pending')) {
    templates.push({
      id: 'payment-specific',
      title: 'Payment Pending Follow-up',
      tone: 'Polite & Professional',
      body: `Hi ${contactName}, hope you're having a great week! 

Reaching out with a quick note regarding the pending milestone payment for ${project.coupleNames}'s wedding deliverables. Could you please let us know when the transfer can be completed? Please let us know if you need account details re-sent. Thank you so much! 🙏`
    });
  }

  // Quick 1-line Ping
  templates.push({
    id: 'quick-ping',
    title: 'Quick 1-Line WhatsApp Ping',
    tone: 'Casual & Fast',
    body: `Hey ${contactName}! 👋 Quick check-in from the studio—any update on your ${pendingText}? Just let us know so we can update our tracker. Thanks!`
  });

  return templates;
}
