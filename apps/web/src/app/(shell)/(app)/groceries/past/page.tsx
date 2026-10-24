import type { Metadata } from "next";

import { PastListsScreen } from "@/components/groceries/past-lists-screen";

export const metadata: Metadata = { title: "Past grocery lists" };

const PastListsPage = () => <PastListsScreen />;

export default PastListsPage;
