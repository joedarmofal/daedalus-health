"use client";

import {
  DEFAULT_AIR_MEDICAL_INPUTS,
  LABOR_ROLES,
  calculateAirMedicalProforma,
  formatProformaCurrency,
  formatProformaNumber,
  formatProformaPercent,
  type AirMedicalProformaInputs,
  type LaborRoleKey,
} from "@/lib/air-medical-proforma";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daedalus-air-medical-proforma";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

function parseStored(raw: string | null): AirMedicalProformaInputs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AirMedicalProformaInputs>;
    const labor = { ...DEFAULT_AIR_MEDICAL_INPUTS.labor };
    for (const role of LABOR_ROLES) {
      const incoming = parsed.labor?.[role.key];
      labor[role.key] = {
        fte: Number(incoming?.fte) || 0,
        annualCompensation: Number(incoming?.annualCompensation) || 0,
      };
    }
    return {
      ...DEFAULT_AIR_MEDICAL_INPUTS,
      ...Object.fromEntries(
        Object.entries(parsed).filter(([key]) => key !== "labor"),
      ),
      labor,
    } as AirMedicalProformaInputs;
  } catch {
    return null;
  }
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#1A2B3C]">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
        className={inputClass}
      />
      {hint ? (
        <span className="mt-1.5 block text-xs leading-5 text-[#1A2B3C]/50">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        strong ? "border-t border-[#1A2B3C]/10 pt-2 font-medium" : ""
      }`}
    >
      <span className="text-sm text-[#1A2B3C]/65">{label}</span>
      <span className="text-sm tabular-nums text-[#1A2B3C]">{value}</span>
    </div>
  );
}

export function AirMedicalProforma() {
  const [inputs, setInputs] = useState<AirMedicalProformaInputs>(
    DEFAULT_AIR_MEDICAL_INPUTS,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setInputs(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [hydrated, inputs]);

  const result = useMemo(() => calculateAirMedicalProforma(inputs), [inputs]);

  function update<K extends keyof AirMedicalProformaInputs>(
    key: K,
    value: AirMedicalProformaInputs[K],
  ) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  function updateLabor(
    key: LaborRoleKey,
    field: "fte" | "annualCompensation",
    value: number,
  ) {
    setInputs((current) => ({
      ...current,
      labor: {
        ...current.labor,
        [key]: {
          ...current.labor[key],
          [field]: value,
        },
      },
    }));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-8">
          <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
              Volume and net revenue
            </p>
            <h3 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
              Transports
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
              Annual volume and net revenue per transport for rotor, fixed wing,
              and ground.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <NumberField
                label="Rotor volume"
                value={inputs.rotorVolume}
                onChange={(value) => update("rotorVolume", value)}
              />
              <NumberField
                label="Rotor net revenue / transport"
                value={inputs.rotorNetRevenue}
                onChange={(value) => update("rotorNetRevenue", value)}
                step="100"
              />
              <div className="rounded-sm border border-[#1A2B3C]/10 bg-[#F7F5F0] p-4">
                <p className="text-xs text-[#1A2B3C]/55">Rotor revenue</p>
                <p className="mt-1 font-serif text-xl text-[#1A2B3C]">
                  {formatProformaCurrency(result.rotorRevenue)}
                </p>
              </div>
              <NumberField
                label="Fixed wing volume"
                value={inputs.fixedWingVolume}
                onChange={(value) => update("fixedWingVolume", value)}
              />
              <NumberField
                label="Fixed wing net revenue / transport"
                value={inputs.fixedWingNetRevenue}
                onChange={(value) => update("fixedWingNetRevenue", value)}
                step="100"
              />
              <div className="rounded-sm border border-[#1A2B3C]/10 bg-[#F7F5F0] p-4">
                <p className="text-xs text-[#1A2B3C]/55">Fixed wing revenue</p>
                <p className="mt-1 font-serif text-xl text-[#1A2B3C]">
                  {formatProformaCurrency(result.fixedWingRevenue)}
                </p>
              </div>
              <NumberField
                label="Ground volume"
                value={inputs.groundVolume}
                onChange={(value) => update("groundVolume", value)}
              />
              <NumberField
                label="Ground net revenue / transport"
                value={inputs.groundNetRevenue}
                onChange={(value) => update("groundNetRevenue", value)}
                step="50"
              />
              <div className="rounded-sm border border-[#1A2B3C]/10 bg-[#F7F5F0] p-4">
                <p className="text-xs text-[#1A2B3C]/55">Ground revenue</p>
                <p className="mt-1 font-serif text-xl text-[#1A2B3C]">
                  {formatProformaCurrency(result.groundRevenue)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
              Labor calculator
            </p>
            <h3 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
              Program labor
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
              Annual labor is FTE × compensation for each role. Benefits apply
              as a percent of wages; benefit cost is an additional annual amount.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1A2B3C]/10 text-xs uppercase tracking-[0.12em] text-[#1A2B3C]/50">
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">FTE</th>
                    <th className="pb-3 pr-4 font-medium">Annual compensation</th>
                    <th className="pb-3 font-medium">Annual cost</th>
                  </tr>
                </thead>
                <tbody>
                  {result.roleLabor.map((role) => (
                    <tr
                      key={role.key}
                      className="border-b border-[#1A2B3C]/10 align-middle"
                    >
                      <td className="py-3 pr-4 text-[#1A2B3C]">{role.label}</td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          value={inputs.labor[role.key].fte}
                          onChange={(event) =>
                            updateLabor(
                              role.key,
                              "fte",
                              Number(event.target.value) || 0,
                            )
                          }
                          className="w-24 rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-2.5 py-1.5 text-sm outline-none focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          step="1000"
                          value={inputs.labor[role.key].annualCompensation}
                          onChange={(event) =>
                            updateLabor(
                              role.key,
                              "annualCompensation",
                              Number(event.target.value) || 0,
                            )
                          }
                          className="w-36 rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-2.5 py-1.5 text-sm outline-none focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
                        />
                      </td>
                      <td className="py-3 tabular-nums text-[#1A2B3C]">
                        {formatProformaCurrency(role.annualCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Employee benefits (% of wages)"
                value={inputs.employeeBenefitsPercent}
                onChange={(value) => update("employeeBenefitsPercent", value)}
                step="0.5"
                hint={`${formatProformaCurrency(result.employeeBenefits)} annually`}
              />
              <NumberField
                label="Benefit cost (annual $)"
                value={inputs.benefitCost}
                onChange={(value) => update("benefitCost", value)}
                step="1000"
                hint="Workers’ comp, extra retirement, or other benefit spend"
              />
            </div>
          </section>

          <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
              Aircraft and operations
            </p>
            <h3 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
              Leases and program costs
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Rotor aircraft"
                value={inputs.rotorAircraft}
                onChange={(value) => update("rotorAircraft", value)}
                step="1"
              />
              <NumberField
                label="Annual lease / rotor aircraft"
                value={inputs.rotorLeasePerAircraft}
                onChange={(value) => update("rotorLeasePerAircraft", value)}
                step="1000"
              />
              <NumberField
                label="Fixed wing aircraft"
                value={inputs.fixedWingAircraft}
                onChange={(value) => update("fixedWingAircraft", value)}
                step="1"
              />
              <NumberField
                label="Annual lease / fixed wing aircraft"
                value={inputs.fixedWingLeasePerAircraft}
                onChange={(value) => update("fixedWingLeasePerAircraft", value)}
                step="1000"
              />
              <NumberField
                label="Fuel cost"
                value={inputs.fuelCost}
                onChange={(value) => update("fuelCost", value)}
                step="1000"
              />
              <NumberField
                label="Insurance cost"
                value={inputs.insuranceCost}
                onChange={(value) => update("insuranceCost", value)}
                step="1000"
              />
              <NumberField
                label="Marketing"
                value={inputs.marketing}
                onChange={(value) => update("marketing", value)}
                step="1000"
              />
              <NumberField
                label="Travel"
                value={inputs.travel}
                onChange={(value) => update("travel", value)}
                step="1000"
              />
              <NumberField
                label="Education"
                value={inputs.education}
                onChange={(value) => update("education", value)}
                step="1000"
              />
              <NumberField
                label="Capital equipment"
                value={inputs.capitalEquipment}
                onChange={(value) => update("capitalEquipment", value)}
                step="1000"
              />
              <NumberField
                label="Depreciation"
                value={inputs.depreciation}
                onChange={(value) => update("depreciation", value)}
                step="1000"
              />
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-28 h-fit rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Annual proforma
          </p>
          <h3 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
            Statement
          </h3>

          <div className="mt-6 space-y-2">
            <Line
              label="Rotor revenue"
              value={formatProformaCurrency(result.rotorRevenue)}
            />
            <Line
              label="Fixed wing revenue"
              value={formatProformaCurrency(result.fixedWingRevenue)}
            />
            <Line
              label="Ground revenue"
              value={formatProformaCurrency(result.groundRevenue)}
            />
            <Line
              label="Total revenue"
              value={formatProformaCurrency(result.totalRevenue)}
              strong
            />
          </div>

          <div className="mt-6 space-y-2">
            <Line
              label={`Wages (${formatProformaNumber(result.totalFte, 1)} FTE)`}
              value={formatProformaCurrency(result.wages)}
            />
            <Line
              label="Employee benefits"
              value={formatProformaCurrency(result.employeeBenefits)}
            />
            <Line
              label="Benefit cost"
              value={formatProformaCurrency(result.benefitCost)}
            />
            <Line
              label="Total labor"
              value={formatProformaCurrency(result.totalLabor)}
              strong
            />
          </div>

          <div className="mt-6 space-y-2">
            <Line
              label="Rotor leases"
              value={formatProformaCurrency(result.rotorLease)}
            />
            <Line
              label="Fixed wing leases"
              value={formatProformaCurrency(result.fixedWingLease)}
            />
            <Line
              label="Fuel, insurance, and other"
              value={formatProformaCurrency(result.operatingCosts)}
            />
            <Line
              label="Total expenses"
              value={formatProformaCurrency(result.totalExpenses)}
              strong
            />
          </div>

          <div className="mt-6 rounded-sm border border-[#1A2B3C]/10 bg-[#F7F5F0] p-4">
            <p className="text-xs text-[#1A2B3C]/55">Operating income</p>
            <p
              className={`mt-1 font-serif text-2xl ${
                result.operatingIncome >= 0 ? "text-[#1F6A64]" : "text-[#8a6d3d]"
              }`}
            >
              {formatProformaCurrency(result.operatingIncome)}
            </p>
            <p className="mt-1 text-xs text-[#1A2B3C]/50">
              {result.marginPercent === null
                ? "Enter revenue to see margin"
                : `${formatProformaPercent(result.marginPercent)} margin`}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <Line
              label="Transports"
              value={formatProformaNumber(result.totalTransports)}
            />
            <Line
              label="Revenue / transport"
              value={
                result.revenuePerTransport === null
                  ? "—"
                  : formatProformaCurrency(result.revenuePerTransport)
              }
            />
            <Line
              label="Cost / transport"
              value={
                result.costPerTransport === null
                  ? "—"
                  : formatProformaCurrency(result.costPerTransport)
              }
            />
            <Line
              label="Contribution / transport"
              value={
                result.contributionPerTransport === null
                  ? "—"
                  : formatProformaCurrency(result.contributionPerTransport)
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
