import type { Metadata } from "next";
import { z } from "zod";

import { ScamScreen } from "@/components/scam/scam-screen";

export const metadata: Metadata = { title: "Scam check" };

const searchSchema = z.object({ email: z.string().optional() });

const ScamPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const parsed = searchSchema.safeParse(await searchParams);

  return (
    <ScamScreen emailId={parsed.success ? (parsed.data.email ?? null) : null} />
  );
};

export default ScamPage;
