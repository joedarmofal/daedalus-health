"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { AI_TOOL_CATEGORIES } from "@/lib/ai-tools-directory";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface VendorActionResult {
  ok: boolean;
  error?: string;
}

function revalidateVendorSurfaces() {
  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function addVendor(formData: FormData): Promise<VendorActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!categoryId || !name || !url || !summary) {
    return { ok: false, error: "Category, name, URL, and summary are required." };
  }

  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, error: "URL must start with http:// or https://." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ai_vendors").insert({
    category_id: categoryId,
    name,
    url,
    summary,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? `${name} is already in that category.`
          : error.message,
    };
  }

  revalidateVendorSurfaces();
  return { ok: true };
}

export async function removeVendor(vendorId: string): Promise<VendorActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  if (!vendorId) {
    return { ok: false, error: "Missing vendor." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ai_vendors").delete().eq("id", vendorId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateVendorSurfaces();
  return { ok: true };
}

export async function importStarterVendors(): Promise<VendorActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const rows = AI_TOOL_CATEGORIES.flatMap((category) =>
    category.tools.map((tool) => ({
      category_id: category.id,
      name: tool.name,
      url: tool.url,
      summary: tool.summary,
    })),
  );

  const supabase = await createClient();
  const { error } = await supabase.from("ai_vendors").upsert(rows, {
    onConflict: "category_id,name",
    ignoreDuplicates: true,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateVendorSurfaces();
  return { ok: true };
}
