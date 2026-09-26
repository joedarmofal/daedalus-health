export interface RoiInputs {
  people: number;
  minutesSavedPerPersonPerDay: number;
  workingDaysPerYear: number;
  hourlyRate: number;
  additionalAnnualSavings: number;
  annualInvestment: number;
}

export interface RoiResult {
  dailyHoursSaved: number;
  dailyFteSavings: number;
  annualHoursSaved: number;
  fteEquivalent: number;
  laborSavings: number;
  totalBenefit: number;
  netValue: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

export const DEFAULT_ROI_INPUTS: RoiInputs = {
  people: 50,
  minutesSavedPerPersonPerDay: 30,
  workingDaysPerYear: 230,
  hourlyRate: 125,
  additionalAnnualSavings: 0,
  annualInvestment: 150000,
};

const HOURS_PER_FTE_DAY = 8;
const HOURS_PER_FTE_YEAR = 2080;

function asNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

export function calculateRoi(inputs: RoiInputs): RoiResult {
  const people = asNonNegative(inputs.people);
  const minutes = asNonNegative(inputs.minutesSavedPerPersonPerDay);
  const days = asNonNegative(inputs.workingDaysPerYear);
  const rate = asNonNegative(inputs.hourlyRate);
  const extra = asNonNegative(inputs.additionalAnnualSavings);
  const investment = asNonNegative(inputs.annualInvestment);

  const dailyHoursSaved = (people * minutes) / 60;
  const dailyFteSavings = dailyHoursSaved / HOURS_PER_FTE_DAY;
  const annualHoursSaved = dailyHoursSaved * days;
  const fteEquivalent = annualHoursSaved / HOURS_PER_FTE_YEAR;
  const laborSavings = annualHoursSaved * rate;
  const totalBenefit = laborSavings + extra;
  const netValue = totalBenefit - investment;

  return {
    dailyHoursSaved,
    dailyFteSavings,
    annualHoursSaved,
    fteEquivalent,
    laborSavings,
    totalBenefit,
    netValue,
    roiPercent: investment > 0 ? (netValue / investment) * 100 : null,
    paybackMonths:
      totalBenefit > 0 && investment > 0
        ? (investment / totalBenefit) * 12
        : null,
  };
}

export function formatHours(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatFte(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}%`;
}

export function formatMonths(value: number): string {
  if (value < 1) {
    return "< 1 month";
  }
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)} months`;
}
