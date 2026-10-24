import type { Metadata } from "next";

import { ThreadScreen } from "@/components/messages/thread-screen";

export const metadata: Metadata = { title: "Conversation" };

const ThreadPage = async ({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) => {
  const { contactId } = await params;

  return <ThreadScreen contactId={contactId} />;
};

export default ThreadPage;
