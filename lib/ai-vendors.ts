import { AI_TOOL_CATEGORIES, type AiToolCategory } from "@/lib/ai-tools-directory";
import { createClient } from "@/lib/supabase/server";

export interface StoredVendor {
  id: string;
  category_id: string;
  name: string;
  url: string;
  summary: string;
}

export interface StoredCategory {
  id: string;
  label: string;
  description: string;
  sort_order: number;
}

export function groupVendors(
  categories: StoredCategory[],
  vendors: StoredVendor[],
): AiToolCategory[] {
  return categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description,
      tools: vendors
        .filter((vendor) => vendor.category_id === category.id)
        .map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          url: vendor.url,
          summary: vendor.summary,
        })),
    }))
    .filter((category) => category.tools.length > 0);
}

export async function fetchStoredVendorCatalog(): Promise<{
  categories: StoredCategory[];
  vendors: StoredVendor[];
} | null> {
  const supabase = await createClient();

  const [{ data: categories, error: categoryError }, { data: vendors, error: vendorError }] =
    await Promise.all([
      supabase
        .from("ai_vendor_categories")
        .select("id, label, description, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("ai_vendors")
        .select("id, category_id, name, url, summary")
        .order("name", { ascending: true }),
    ]);

  if (categoryError || vendorError) {
    return null;
  }

  return {
    categories: categories ?? [],
    vendors: vendors ?? [],
  };
}

export async function fetchAiVendorDirectory(): Promise<AiToolCategory[]> {
  const stored = await fetchStoredVendorCatalog();
  if (!stored || stored.vendors.length === 0) {
    return AI_TOOL_CATEGORIES;
  }
  return groupVendors(stored.categories, stored.vendors);
}
