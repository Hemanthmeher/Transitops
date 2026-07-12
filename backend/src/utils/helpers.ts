import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePassword = (length: number = 12): string => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

export const calculateSafetyScore = (
  experienceYears: number,
  totalTrips: number,
  completedTrips: number,
  incidents: number = 0
): number => {
  const experienceFactor = Math.min(experienceYears * 5, 30);
  const completionFactor = totalTrips > 0 ? (completedTrips / totalTrips) * 40 : 0;
  const incidentPenalty = Math.min(incidents * 10, 30);
  const baseScore = 30;

  return Math.min(Math.max(Math.round(baseScore + experienceFactor + completionFactor - incidentPenalty), 0), 100);
};

export const calculateFleetUtilization = (
  activeTrips: number,
  totalVehicles: number
): number => {
  if (totalVehicles === 0) return 0;
  return Math.round((activeTrips / totalVehicles) * 100);
};

export const slugify = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const paginate = (page: number = 1, limit: number = 10) => {
  const p = Math.max(1, page);
  const l = Math.min(Math.max(1, limit), 100);
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
};

export const generateCsv = (headers: string[], rows: any[][]): string => {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
};
