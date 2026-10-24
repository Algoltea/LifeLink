import type { Metadata } from "next";

import { PracticeScreen } from "@/features/rehearsals/practice-screen";

export const metadata: Metadata = { title: "Conversation practice" };

const PracticePage = () => <PracticeScreen />;

export default PracticePage;
