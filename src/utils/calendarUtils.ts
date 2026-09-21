import { ClientProject } from '../types';
import { formatDateString } from './dateUtils';
import { formatPendingWorksList } from './messageTemplates';

/**
 * Generates a direct 1-click Google Calendar URL to schedule a reminder on the exact date client provided
 */
export function generateGoogleCalendarUrl(project: ClientProject): string {
  const reminderDate = project.clientPromisedDate || project.nextFollowUpDate;
  if (!reminderDate) return '#';

  const dateParts = reminderDate.split('-');
  if (dateParts.length !== 3) return '#';

  const [year, month, day] = dateParts;
  const startDateStr = `${year}${month}${day}T043000Z`; // 10:00 AM local roughly
  const endDateStr = `${year}${month}${day}T050000Z`;

  const pendingText = formatPendingWorksList(project.pendingWorks);
  const title = encodeURIComponent(
    `[Client Reminder] ${project.coupleNames}: ${pendingText}`
  );

  const cleanPhone = project.clientPhone.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

  const detailsText = [
    `Client: ${project.coupleNames} (${project.contactPerson})`,
    `Phone / WhatsApp: ${project.clientPhone}`,
    `Pending Works: ${pendingText}`,
    project.coordinationNeed ? `Details: ${project.coordinationNeed}` : '',
    project.clientPromisedDate ? `Date Client Provided: ${formatDateString(project.clientPromisedDate)}` : '',
    project.draftReviewLink ? `Draft Review Link: ${project.draftReviewLink}` : '',
    waUrl ? `Direct WhatsApp Link: ${waUrl}` : '',
    '',
    'Scheduled via Wedding Post-Production Client Tracker'
  ]
    .filter(Boolean)
    .join('\n');

  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}`;
}

/**
 * Generates and triggers download of an .ics file for Apple Calendar, Outlook, etc.
 */
export function downloadIcsCalendarReminder(project: ClientProject) {
  const reminderDate = project.clientPromisedDate || project.nextFollowUpDate;
  if (!reminderDate) return;

  const [year, month, day] = reminderDate.split('-');
  const dtStart = `${year}${month}${day}T100000`;
  const dtEnd = `${year}${month}${day}T103000`;
  const uid = `client-reminder-${project.id}-${Date.now()}@postprod.tracker`;

  const pendingText = formatPendingWorksList(project.pendingWorks);
  const cleanPhone = project.clientPhone.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

  const summary = `Reminder: Message ${project.coupleNames} on WhatsApp (${pendingText})`;
  const description = `Client: ${project.coupleNames}\\nPending: ${pendingText}\\nDate Provided: ${project.clientPromisedDate || 'None'}\\nWhatsApp: ${waUrl}\\nDetails: ${project.coordinationNeed || 'N/A'}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Post-Production Tracker//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${year}${month}${day}T000000Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Follow up with ${project.coupleNames} for ${pendingText}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Reminder_${project.coupleNames.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
