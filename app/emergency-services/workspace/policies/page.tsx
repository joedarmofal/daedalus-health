import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  listEmergencyPolicies,
  policyCategoryLabel,
  policyStatusLabel,
} from "@/lib/emergency-policies";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PolicyLibraryPage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  let policies: Awaited<ReturnType<typeof listEmergencyPolicies>>["policies"] =
    [];
  let tableMissing = false;
  try {
    const listed = await listEmergencyPolicies(access.org.id);
    policies = listed.policies;
    tableMissing = listed.tableMissing;
  } catch {
    tableMissing = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
            POLICY LIBRARY
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
            {access.org.name} policies
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
            Draft clinical or administrative policies with the AI assistant,
            then keep the adopted versions here for this organization only.
          </p>
        </div>
        <Link
          href="/emergency-services/workspace/policies/new"
          className="rounded-sm bg-[#1F6A64] px-4 py-2.5 text-sm font-medium text-[#F9F8F3] hover:bg-[#1A2B3C]"
        >
          Develop a policy
        </Link>
      </div>

      {tableMissing ? (
        <p className="mt-6 rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 px-4 py-3 text-sm text-[#1A2B3C]">
          Policy saves need the library table. Run{" "}
          <code className="font-mono text-xs">008_emergency_policies.sql</code>{" "}
          in the Supabase SQL Editor.
        </p>
      ) : null}

      {policies.length === 0 && !tableMissing ? (
        <p className="mt-8 rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] px-4 py-5 text-sm text-[#1A2B3C]/70">
          No policies in this library yet. Start a clinical or administrative
          draft and save it here.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#1A2B3C]/10 text-xs uppercase tracking-[0.14em] text-[#1A2B3C]/50">
              <tr>
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="border-t border-[#1A2B3C]/8">
                  <td className="px-4 py-3">
                    <Link
                      href={`/emergency-services/workspace/policies/${policy.id}`}
                      className="font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
                    >
                      {policy.title}
                    </Link>
                    {policy.purpose ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[#1A2B3C]/50">
                        {policy.purpose}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[#1A2B3C]/65">
                    {policyCategoryLabel(policy.category)}
                  </td>
                  <td className="px-4 py-3">{policyStatusLabel(policy.status)}</td>
                  <td className="px-4 py-3 text-[#1A2B3C]/65">
                    {policy.owner_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#1A2B3C]/55">
                    {new Date(policy.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
