import type { Metadata } from "next";

import { TodayScreen } from "@/components/today/today-screen";

export const metadata: Metadata = { title: "Today" };

const TodayPage = () => <TodayScreen />;

export default TodayPage;
