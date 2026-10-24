import type { Metadata } from "next";
import { z } from "zod";

import { EmailScreen } from "@/components/email/email-screen";

export const metadata: Metadata = { title: "Email" };

const searchSchema = z.object({ id: z.string().optional() });

const EmailPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const parsed = searchSchema.safeParse(await searchParams);

  return (
    <EmailScreen
      initialEmailId={parsed.success ? (parsed.data.id ?? null) : null}
    />
  );
};

export default EmailPage;
