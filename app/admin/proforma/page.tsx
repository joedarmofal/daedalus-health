import { getAdminAccess } from "@/lib/admin-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AirMedicalProforma } from "./air-medical-proforma";

export const metadata: Metadata = {
  title: "Admin · Proforma",
};

export default async function AdminProformaPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Proforma development
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Program proformas
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Build an annual operating picture from volume, net revenue, labor, and
        program costs. Values stay in this browser so you can refine the model
        over time.
      </p>

      <section className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
          Specific tool
        </p>
        <h2 className="mt-2 font-serif text-2xl font-medium text-[#1A2B3C]">
          Air Medical Program Proforma
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1A2B3C]/65">
          Rotor, fixed wing, and ground transports with a role-based labor
          calculator and aircraft lease, benefits, and operating expenses.
        </p>
        <div className="mt-8">
          <AirMedicalProforma />
        </div>
      </section>
    </div>
  );
}
