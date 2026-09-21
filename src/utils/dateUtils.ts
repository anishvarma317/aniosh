import { ClientProject, UrgencyLevel } from '../types';

export const TODAY_STR = '2026-09-20'; // Current reference date

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateString(dateStr?: string): string {
  if (!dateStr) return 'No date set';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getDaysDifference(targetDateStr: string, fromDateStr: string = TODAY_STR): number {
  if (!targetDateStr) return 0;
  const target = parseDate(targetDateStr);
  const from = parseDate(fromDateStr);
  const diffTime = target.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeUrgency(project: ClientProject): {
  level: UrgencyLevel;
  reason: string;
  badgeClass: string;
  isActionRequiredToday: boolean;
  daysUntilClientDate: number | null;
} {
  if (project.status === 'delivered') {
    return {
      level: 'low',
      reason: 'Project Delivered & Complete',
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      isActionRequiredToday: false,
      daysUntilClientDate: null,
    };
  }

  if (project.status === 'resolved') {
    return {
      level: 'low',
      reason: 'All pending items updated / received',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isActionRequiredToday: false,
      daysUntilClientDate: null,
    };
  }

  // If client provided a date
  if (project.clientPromisedDate) {
    const days = getDaysDifference(project.clientPromisedDate, TODAY_STR);

    if (days < 0) {
      // The date client provided has PASSED, and it's not marked updated!
      const overdueDays = Math.abs(days);
      return {
        level: 'critical',
        reason: `Client provided date was ${formatDateString(project.clientPromisedDate)} (${overdueDays}d overdue). Keep reminding until updated in app!`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        isActionRequiredToday: true,
        daysUntilClientDate: days,
      };
    }

    if (days === 0) {
      // EXACT DATE IS TODAY!
      return {
        level: 'critical',
        reason: `Exact date client provided is TODAY (${formatDateString(project.clientPromisedDate)})! Send WhatsApp reminder now.`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        isActionRequiredToday: true,
        daysUntilClientDate: 0,
      };
    }

    if (days === 1) {
      return {
        level: 'high',
        reason: `Client provided date is TOMORROW (${formatDateString(project.clientPromisedDate)}).`,
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        isActionRequiredToday: false,
        daysUntilClientDate: 1,
      };
    }

    return {
      level: 'low',
      reason: `Client promised to update on ${formatDateString(project.clientPromisedDate)} (${days} days away).`,
      badgeClass: 'bg-zinc-50 text-zinc-600 border-zinc-200',
      isActionRequiredToday: false,
      daysUntilClientDate: days,
    };
  }

  // Client hasn't provided any date yet
  return {
    level: 'high',
    reason: 'Client has not provided a date yet. Send WhatsApp nudge to get a promised date!',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    isActionRequiredToday: true,
    daysUntilClientDate: null,
  };
}
