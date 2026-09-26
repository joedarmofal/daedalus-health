"use client";

import type { StoredCategory, StoredVendor } from "@/lib/ai-vendors";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { addVendor, importStarterVendors, removeVendor } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

export function VendorEditor({
  categories,
  vendors,
  tableReady,
}: {
  categories: StoredCategory[];
  vendors: StoredVendor[];
  tableReady: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      vendors: vendors.filter((vendor) => vendor.category_id === category.id),
    }));
  }, [categories, vendors]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const result = await addVendor(new FormData(form));
    setStatus("idle");

    if (!result.ok) {
      setError(result.error ?? "Could not add the vendor.");
      return;
    }

    form.reset();
    setMessage("Vendor added.");
    router.refresh();
  }

  async function handleImport() {
    setStatus("loading");
    setError(null);
    setMessage(null);
    const result = await importStarterVendors();
    setStatus("idle");
    if (!result.ok) {
      setError(result.error ?? "Import failed. Confirm the Supabase migration has been run.");
      return;
    }
    setMessage("Starter directory imported.");
    router.refresh();
  }

  async function handleRemove(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the directory?`)) {
      return;
    }
    setStatus("loading");
    setError(null);
    setMessage(null);
    const result = await removeVendor(id);
    setStatus("idle");
    if (!result.ok) {
      setError(result.error ?? "Could not remove the vendor.");
      return;
    }
    setMessage(`${name} removed.`);
    router.refresh();
  }

  if (!tableReady) {
    return (
      <div className="rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 p-6 text-sm leading-6 text-[#1A2B3C]/80">
        The <code className="font-mono text-xs">ai_vendors</code> table is not
        available yet. Run{" "}
        <code className="font-mono text-xs">
          supabase-migrations/003_ai_vendors.sql
        </code>{" "}
        in the Supabase SQL Editor, then refresh this page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-sm border border-[#1F6A64]/25 bg-[#1F6A64]/10 px-3 py-2 text-sm text-[#1F6A64]">
          {message}
        </p>
      ) : null}

      <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
        <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
          Add a vendor
        </h2>
        <form onSubmit={handleAdd} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#1A2B3C]">Category</span>
            <select
              name="categoryId"
              required
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Name</span>
            <input name="name" required className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Website</span>
            <input
              name="url"
              type="url"
              required
              placeholder="https://"
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#1A2B3C]">Summary</span>
            <textarea
              name="summary"
              required
              rows={3}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-sm bg-[#1A2B3C] px-5 py-2.5 text-sm font-medium text-[#F9F8F3] transition hover:bg-[#1F6A64] disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : "Add vendor"}
            </button>
            {vendors.length === 0 ? (
              <button
                type="button"
                disabled={status === "loading"}
                onClick={handleImport}
                className="rounded-sm border border-[#1A2B3C]/25 px-5 py-2.5 text-sm font-medium text-[#1A2B3C] transition hover:border-[#C4A574] disabled:opacity-60"
              >
                Import starter directory
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {grouped.map((category) => (
        <section key={category.id}>
          <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
            {category.label}
          </h2>
          <p className="mt-1 text-sm text-[#1A2B3C]/60">
            {category.vendors.length} vendor
            {category.vendors.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4 space-y-3">
            {category.vendors.length === 0 ? (
              <p className="text-sm text-[#1A2B3C]/50">None yet.</p>
            ) : (
              category.vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-col gap-3 rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[#1A2B3C]">{vendor.name}</p>
                    <p className="mt-1 text-sm leading-6 text-[#1A2B3C]/65">
                      {vendor.summary}
                    </p>
                    <a
                      href={vendor.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm text-[#1F6A64] hover:text-[#1A2B3C]"
                    >
                      {vendor.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    disabled={status === "loading"}
                    onClick={() => handleRemove(vendor.id, vendor.name)}
                    className="shrink-0 text-sm font-medium text-red-800/80 hover:text-red-900 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
