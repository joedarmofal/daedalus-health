export const LABOR_ROLES = [
  { key: "pilots", label: "Pilots" },
  { key: "nurses", label: "Nurses" },
  { key: "paramedics", label: "Paramedics" },
  { key: "emts", label: "EMTs" },
  { key: "rts", label: "Respiratory therapists" },
  { key: "medicalDirectors", label: "Medical directors" },
  { key: "leadership", label: "Leadership" },
  { key: "mechanics", label: "Mechanics" },
  { key: "communicationSpecialists", label: "Communication specialists" },
] as const;

export type LaborRoleKey = (typeof LABOR_ROLES)[number]["key"];

export interface LaborRoleInput {
  fte: number;
  annualCompensation: number;
}

export interface AirMedicalProformaInputs {
  rotorVolume: number;
  rotorNetRevenue: number;
  rotorAircraft: number;
  rotorLeasePerAircraft: number;
  fixedWingVolume: number;
  fixedWingNetRevenue: number;
  fixedWingAircraft: number;
  fixedWingLeasePerAircraft: number;
  groundVolume: number;
  groundNetRevenue: number;
  labor: Record<LaborRoleKey, LaborRoleInput>;
  benefitCost: number;
  employeeBenefitsPercent: number;
  fuelCost: number;
  insuranceCost: number;
  marketing: number;
  travel: number;
  education: number;
  capitalEquipment: number;
  depreciation: number;
}

export interface RoleLaborResult {
  key: LaborRoleKey;
  label: string;
  fte: number;
  annualCompensation: number;
  annualCost: number;
}

export interface AirMedicalProformaResult {
  rotorRevenue: number;
  fixedWingRevenue: number;
  groundRevenue: number;
  totalRevenue: number;
  totalTransports: number;
  roleLabor: RoleLaborResult[];
  totalFte: number;
  wages: number;
  employeeBenefits: number;
  benefitCost: number;
  totalLabor: number;
  rotorLease: number;
  fixedWingLease: number;
  totalLease: number;
  operatingCosts: number;
  totalExpenses: number;
  operatingIncome: number;
  marginPercent: number | null;
  revenuePerTransport: number | null;
  costPerTransport: number | null;
  contributionPerTransport: number | null;
}

function asNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

function role(
  fte: number,
  annualCompensation: number,
): LaborRoleInput {
  return { fte, annualCompensation };
}

export const DEFAULT_AIR_MEDICAL_INPUTS: AirMedicalProformaInputs = {
  rotorVolume: 800,
  rotorNetRevenue: 12000,
  rotorAircraft: 2,
  rotorLeasePerAircraft: 540000,
  fixedWingVolume: 200,
  fixedWingNetRevenue: 18000,
  fixedWingAircraft: 1,
  fixedWingLeasePerAircraft: 720000,
  groundVolume: 400,
  groundNetRevenue: 2500,
  labor: {
    pilots: role(8, 120000),
    nurses: role(10, 110000),
    paramedics: role(8, 75000),
    emts: role(4, 45000),
    rts: role(2, 80000),
    medicalDirectors: role(1, 180000),
    leadership: role(3, 140000),
    mechanics: role(4, 95000),
    communicationSpecialists: role(6, 65000),
  },
  benefitCost: 0,
  employeeBenefitsPercent: 30,
  fuelCost: 800000,
  insuranceCost: 450000,
  marketing: 75000,
  travel: 40000,
  education: 35000,
  capitalEquipment: 150000,
  depreciation: 200000,
};

export function calculateAirMedicalProforma(
  inputs: AirMedicalProformaInputs,
): AirMedicalProformaResult {
  const rotorVolume = asNonNegative(inputs.rotorVolume);
  const rotorNetRevenue = asNonNegative(inputs.rotorNetRevenue);
  const rotorAircraft = asNonNegative(inputs.rotorAircraft);
  const rotorLeasePerAircraft = asNonNegative(inputs.rotorLeasePerAircraft);
  const fixedWingVolume = asNonNegative(inputs.fixedWingVolume);
  const fixedWingNetRevenue = asNonNegative(inputs.fixedWingNetRevenue);
  const fixedWingAircraft = asNonNegative(inputs.fixedWingAircraft);
  const fixedWingLeasePerAircraft = asNonNegative(
    inputs.fixedWingLeasePerAircraft,
  );
  const groundVolume = asNonNegative(inputs.groundVolume);
  const groundNetRevenue = asNonNegative(inputs.groundNetRevenue);

  const rotorRevenue = rotorVolume * rotorNetRevenue;
  const fixedWingRevenue = fixedWingVolume * fixedWingNetRevenue;
  const groundRevenue = groundVolume * groundNetRevenue;
  const totalRevenue = rotorRevenue + fixedWingRevenue + groundRevenue;
  const totalTransports = rotorVolume + fixedWingVolume + groundVolume;

  const roleLabor = LABOR_ROLES.map((item) => {
    const current = inputs.labor[item.key];
    const fte = asNonNegative(current?.fte ?? 0);
    const annualCompensation = asNonNegative(current?.annualCompensation ?? 0);
    return {
      key: item.key,
      label: item.label,
      fte,
      annualCompensation,
      annualCost: fte * annualCompensation,
    };
  });

  const totalFte = roleLabor.reduce((sum, item) => sum + item.fte, 0);
  const wages = roleLabor.reduce((sum, item) => sum + item.annualCost, 0);
  const employeeBenefits =
    wages * (asNonNegative(inputs.employeeBenefitsPercent) / 100);
  const benefitCost = asNonNegative(inputs.benefitCost);
  const totalLabor = wages + employeeBenefits + benefitCost;

  const rotorLease = rotorAircraft * rotorLeasePerAircraft;
  const fixedWingLease = fixedWingAircraft * fixedWingLeasePerAircraft;
  const totalLease = rotorLease + fixedWingLease;

  const operatingCosts =
    asNonNegative(inputs.fuelCost) +
    asNonNegative(inputs.insuranceCost) +
    asNonNegative(inputs.marketing) +
    asNonNegative(inputs.travel) +
    asNonNegative(inputs.education) +
    asNonNegative(inputs.capitalEquipment) +
    asNonNegative(inputs.depreciation);

  const totalExpenses = totalLabor + totalLease + operatingCosts;
  const operatingIncome = totalRevenue - totalExpenses;

  return {
    rotorRevenue,
    fixedWingRevenue,
    groundRevenue,
    totalRevenue,
    totalTransports,
    roleLabor,
    totalFte,
    wages,
    employeeBenefits,
    benefitCost,
    totalLabor,
    rotorLease,
    fixedWingLease,
    totalLease,
    operatingCosts,
    totalExpenses,
    operatingIncome,
    marginPercent:
      totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : null,
    revenuePerTransport:
      totalTransports > 0 ? totalRevenue / totalTransports : null,
    costPerTransport:
      totalTransports > 0 ? totalExpenses / totalTransports : null,
    contributionPerTransport:
      totalTransports > 0 ? operatingIncome / totalTransports : null,
  };
}

export function formatProformaCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatProformaNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatProformaPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}
