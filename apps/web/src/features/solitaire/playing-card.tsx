import { cardColor, rankSymbol, suitSymbol } from "@lifelink/solitaire/cards";
import type { Card } from "@lifelink/solitaire/cards";
import { cn } from "@lifelink/ui/lib/utils";

/*
 * Card art is sized in container units (cqi): every pile wraps its cards in an
 * inline-size container exactly one card wide, so the corner index and the
 * centre pip grow with the card on any screen and any text-size setting.
 */

interface CardFaceProps {
  readonly card: Card;
  readonly tone?: "hint" | "plain" | "selected";
}

export const CardFace = ({ card, tone = "plain" }: CardFaceProps) => {
  const ink =
    cardColor(card.suit) === "red" ? "text-negative" : "text-foreground";

  return (
    <span
      className={cn(
        "border-control flex size-full flex-col rounded-md border-2 p-[7cqi]",
        tone === "selected" ? "bg-accent" : "bg-raised",
        ink
      )}
    >
      <span
        aria-hidden="true"
        className="flex items-baseline gap-[3cqi] text-[30cqi] leading-none font-semibold"
      >
        <span>{rankSymbol(card.rank)}</span>
        <span>{suitSymbol(card.suit)}</span>
      </span>
      <span
        aria-hidden="true"
        className="mt-auto self-center pb-[6cqi] text-[58cqi] leading-none"
      >
        {suitSymbol(card.suit)}
      </span>
    </span>
  );
};

export const CardBack = () => (
  <span className="border-control bg-neutral-wash relative block size-full rounded-md border-2">
    <span className="border-brass absolute inset-[9cqi] rounded-sm border" />
  </span>
);

interface EmptyPileProps {
  readonly label: string;
}

export const EmptyPile = ({ label }: EmptyPileProps) => (
  <span className="border-control text-muted-foreground text-label flex size-full items-center justify-center rounded-md border-2 border-dashed text-center">
    {label}
  </span>
);
