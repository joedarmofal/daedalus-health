import { getAccreditationAccess } from "@/lib/accreditation-access";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PolicyEditor } from "../policy-editor";

export default async function NewPolicyPage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/emergency-services/workspace/policies"
        className="text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
      >
        ← Policy library
      </Link>
      <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        DEVELOP A POLICY
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Clinical or administrative draft
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#1A2B3C]/70">
        Use the assistant to write a first draft from a prompt or uploaded
        materials, then save it to the {access.org.name} library.
      </p>
      <div className="mt-8">
        <PolicyEditor />
      </div>
    </div>
  );
}
