import { getAdminAccess } from "@/lib/admin-access";
import { fetchStoredVendorCatalog } from "@/lib/ai-vendors";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VendorEditor } from "./vendor-editor";

export const metadata: Metadata = {
  title: "Admin · AI Tools",
};

export default async function AdminVendorsPage() {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    redirect("/admin");
  }

  const catalog = await fetchStoredVendorCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Mission Control
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        AI vendor directory
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Add or remove companies that appear in the client-portal Toolkit.
        {catalog
          ? ` ${catalog.vendors.length} vendors in the live directory.`
          : ""}
      </p>
      <div className="mt-8">
        <VendorEditor
          tableReady={catalog !== null}
          categories={catalog?.categories ?? []}
          vendors={catalog?.vendors ?? []}
        />
      </div>
    </div>
  );
}
