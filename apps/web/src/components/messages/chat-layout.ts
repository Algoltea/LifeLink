/** Messages fills the page gutters; the transcript and dock share one reading column. */
const MESSAGES_READING_COLUMN = "mx-auto w-full max-w-[42.222rem]";

/**
 * Narrow screens bleed the conversation to the page edges. Beside the list it
 * sits in its pane and only runs on into the page's bottom padding.
 */
const MESSAGES_WORKSPACE =
  "-mx-[1.111rem] -my-6 flex h-[calc(100dvh-10rem)] min-h-0 flex-col sm:-mx-[2.222rem] min-[1101px]:-my-8 @3xl/content:mx-0 @3xl/content:mt-0";

const MESSAGES_HEADER =
  "border-rule flex shrink-0 items-center gap-2 border-b px-2 py-2 sm:gap-3 sm:px-7 sm:py-3.5 @3xl/content:px-0 @3xl/content:pt-0";

const MESSAGES_TRANSCRIPT =
  "min-h-32 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 sm:px-7 sm:pt-6 @3xl/content:px-0 @3xl/content:pt-5";

const MESSAGES_DOCK =
  "shrink-0 px-3 pt-2 pb-[max(0.778rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-4 @3xl/content:px-0";

export {
  MESSAGES_DOCK,
  MESSAGES_HEADER,
  MESSAGES_READING_COLUMN,
  MESSAGES_TRANSCRIPT,
  MESSAGES_WORKSPACE,
};
