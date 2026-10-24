import type { Metadata } from "next";
import { z } from "zod";

import { GroceriesScreen } from "@/components/groceries/groceries-screen";

export const metadata: Metadata = { title: "Groceries" };

const searchSchema = z.object({ list: z.string().optional() });

const GroceriesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const parsed = searchSchema.safeParse(await searchParams);

  return (
    <GroceriesScreen
      initialListId={parsed.success ? (parsed.data.list ?? null) : null}
    />
  );
};

export default GroceriesPage;
