import type { ReactNode } from "react";

import { MessagesFrame } from "@/components/messages/messages-frame";

/** The conversation list stays put while conversations open beside it. */
const MessagesLayout = ({ children }: { children: ReactNode }) => (
  <MessagesFrame>{children}</MessagesFrame>
);

export default MessagesLayout;
