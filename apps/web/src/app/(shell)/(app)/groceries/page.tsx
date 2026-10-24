import type { Metadata } from "next";

import { GroceriesScreen } from "@/components/groceries/groceries-screen";

export const metadata: Metadata = { title: "Groceries" };

const GroceriesPage = () => <GroceriesScreen />;

export default GroceriesPage;
