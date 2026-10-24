"use client";

import { EmptyNote } from "@/components/app/states";

/** With no conversation open, wide screens say what the space beside the list is for. */
const MessagesScreen = () => (
  <EmptyNote className="hidden @3xl/content:mt-12 @3xl/content:flex">
    Choose someone to read your conversation and write back.
  </EmptyNote>
);

export { MessagesScreen };
