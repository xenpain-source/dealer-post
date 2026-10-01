import type { Metadata } from "next";
import { NewListingForm } from "@/components/dashboard/NewListingForm";

export const metadata: Metadata = {
  title: "Add a car",
};

export default function NewListingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="dl-h1">Add a car</h1>
      <p className="dl-small mt-1">
        Add it once — it&apos;s saved to your inventory right away.
      </p>

      <NewListingForm />
    </div>
  );
}
