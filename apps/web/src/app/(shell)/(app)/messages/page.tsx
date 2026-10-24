import type { Metadata } from "next";

import { MessagesScreen } from "@/components/messages/messages-screen";

export const metadata: Metadata = { title: "Messages" };

const MessagesPage = () => <MessagesScreen />;

export default MessagesPage;
