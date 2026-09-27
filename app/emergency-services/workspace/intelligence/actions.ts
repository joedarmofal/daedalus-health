"use server";

import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  searchFlights,
  type FlightSearchResult,
} from "@/lib/flight-tracking";

export async function searchEmergencyFlights(
  formData: FormData,
): Promise<FlightSearchResult | { ok: false; error: string }> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to the emergency services workspace first." };
  }

  return searchFlights({
    tailNumber: String(formData.get("tailNumber") ?? ""),
    dateFrom: String(formData.get("dateFrom") ?? ""),
    dateTo: String(formData.get("dateTo") ?? ""),
    airports: String(formData.get("airports") ?? ""),
  });
}
