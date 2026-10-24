import type { Metadata } from "next";

import { AskScreen } from "@/components/assistant/ask-screen";

export const metadata: Metadata = { title: "Ask LifeLink" };

const AskPage = () => <AskScreen />;

export default AskPage;
