import { getAccreditationAccess } from "@/lib/accreditation-access";
import { redirect } from "next/navigation";
import { FlightSearchForm } from "./flight-search-form";

export default async function BusinessIntelligencePage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        BUSINESS INTELLIGENCE
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Flight tracking
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
        Research public ADS-B activity for {access.org.name}. Search by tail
        number (for example N851MB), date range, and airport codes such as CPR
        or APA. Results come from OpenSky Network historical flights and live
        community ADS-B feeds.
      </p>
      <div className="mt-8">
        <FlightSearchForm />
      </div>
    </div>
  );
}
