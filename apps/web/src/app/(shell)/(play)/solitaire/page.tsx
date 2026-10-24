import type { Metadata } from "next";

import { SolitaireGame } from "@/features/solitaire/solitaire-game";

export const metadata: Metadata = {
  description:
    "Klondike solitaire with large cards, keyboard play, tap-to-move, and undo. Works offline.",
  title: "Solitaire",
};

const SolitairePage = () => <SolitaireGame />;

export default SolitairePage;
