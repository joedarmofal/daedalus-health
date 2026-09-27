import {
  CAMTS_SECTIONS,
  allCamtsItems,
  type PifStatus,
} from "@/lib/camts-pif";
import type { AccreditationPifItem } from "@/lib/accreditation-data";

export function pifItemMap(
  items: AccreditationPifItem[],
): Map<string, AccreditationPifItem> {
  return new Map(items.map((item) => [item.standard_id, item]));
}

export function itemStatus(
  items: Map<string, AccreditationPifItem>,
  standardId: string,
): PifStatus {
  return items.get(standardId)?.status ?? "not_started";
}

export function sectionProgress(
  sectionId: string,
  items: Map<string, AccreditationPifItem>,
) {
  const section = CAMTS_SECTIONS.find((entry) => entry.id === sectionId);
  const total = section?.items.length ?? 0;
  const ready =
    section?.items.filter((item) => items.get(item.id)?.status === "ready")
      .length ?? 0;
  const gaps =
    section?.items.filter((item) => items.get(item.id)?.status === "gap")
      .length ?? 0;
  const started =
    section?.items.filter((item) => {
      const status = items.get(item.id)?.status;
      return status && status !== "not_started";
    }).length ?? 0;

  return { total, ready, gaps, started };
}

export function overallProgress(items: Map<string, AccreditationPifItem>) {
  const total = allCamtsItems().length;
  let ready = 0;
  let gaps = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const standard of allCamtsItems()) {
    const status = items.get(standard.id)?.status ?? "not_started";
    if (status === "ready") ready += 1;
    else if (status === "gap") gaps += 1;
    else if (status === "in_progress") inProgress += 1;
    else notStarted += 1;
  }

  return { total, ready, gaps, inProgress, notStarted };
}
