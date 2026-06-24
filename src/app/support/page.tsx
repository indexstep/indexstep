import type { Metadata } from "next";
import SupportForm from "./SupportForm";

export const metadata: Metadata = {
  title: "Support | stephud",
  description: "Need help? Leave a support ticket and we'll get back to you.",
};

export default function SupportPage() {
  return <SupportForm />;
}
