import type { Metadata } from "next";

import { CircleScreen } from "@/components/circle/circle-screen";

export const metadata: Metadata = { title: "Trusted circle" };

const CirclePage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initiallyAdding = params.add === "1";

  return (
    <CircleScreen
      initiallyAdding={initiallyAdding}
      key={initiallyAdding ? "add" : "people"}
    />
  );
};

export default CirclePage;
