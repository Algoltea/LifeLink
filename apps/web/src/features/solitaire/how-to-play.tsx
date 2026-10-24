import { ChevronDownIcon } from "lucide-react";

const KEYS = [
  { action: "Move between piles and cards", keys: "Arrow keys" },
  {
    action: "Pick up a card, or put the picked card down",
    keys: "Enter or Space",
  },
  {
    action: "Send the picked card to a foundation",
    keys: "Enter again on the same card",
  },
  { action: "Put the card back", keys: "Escape" },
  { action: "Draw from the stock", keys: "D" },
  { action: "Undo the last move", keys: "U, or Ctrl+Z" },
  { action: "Show a hint", keys: "H" },
  { action: "Send every safe card to the foundations", keys: "F" },
] as const;

export const HowToPlay = () => (
  <details className="group border-border text-body rounded-lg border px-4 py-2 sm:px-6">
    <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 font-semibold">
      How to play
      <ChevronDownIcon
        aria-hidden="true"
        className="text-muted-foreground size-5 shrink-0 group-open:rotate-180"
      />
    </summary>
    <div className="flex flex-col gap-6 pt-4 pb-4">
      <p className="max-w-prose">
        Build four piles, one per suit, from ace up to king. In the seven
        columns, place a card on one that is one higher and the other colour: a
        red 7 on a black 8. Only a king can go into an empty column. Draw from
        the stock when you are stuck.
      </p>
      <p className="max-w-prose">
        Tap a card to pick it up, then tap where it should go. When a card has
        only one place to go, a single tap moves it there. Tap the picked card
        again to send it to a foundation, or double-tap any card to do the same.
      </p>
      <table className="text-label w-full text-left">
        <caption className="sr-only">Keyboard keys</caption>
        <thead>
          <tr className="text-muted-foreground">
            <th className="w-2/5 py-3 pr-4 font-medium" scope="col">
              Key
            </th>
            <th className="py-3 font-medium" scope="col">
              What it does
            </th>
          </tr>
        </thead>
        <tbody>
          {KEYS.map((row) => (
            <tr className="border-rule border-t" key={row.keys}>
              <th className="py-3 pr-4 align-top font-medium" scope="row">
                {row.keys}
              </th>
              <td className="py-3 align-top">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);
