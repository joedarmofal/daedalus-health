import type { Metadata } from "next";
import { UpdatePasswordGate } from "./update-password-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordGate />;
}
