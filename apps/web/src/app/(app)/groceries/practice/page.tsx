import type { Metadata } from "next";

import { PracticeScreen } from "@/components/groceries/practice-screen";

export const metadata: Metadata = { title: "Practice shopping page" };

const PracticePage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { list } = await searchParams;

  return (
    <PracticeScreen
      listId={Array.isArray(list) ? (list[0] ?? null) : (list ?? null)}
    />
  );
};

export default PracticePage;
