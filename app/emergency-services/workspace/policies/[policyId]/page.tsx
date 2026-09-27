import { getAccreditationAccess } from "@/lib/accreditation-access";
import { getEmergencyPolicy } from "@/lib/emergency-policies";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PolicyEditor } from "../policy-editor";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  const policy = await getEmergencyPolicy(access.org.id, policyId);
  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/emergency-services/workspace/policies"
        className="text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
      >
        ← Policy library
      </Link>
      <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        POLICY
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        {policy.title}
      </h1>
      <div className="mt-8">
        <PolicyEditor policy={policy} />
      </div>
    </div>
  );
}
