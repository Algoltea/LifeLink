import type { Metadata } from "next";

import { MahjongGame } from "@/features/mahjong/mahjong-game";

export const metadata: Metadata = {
  description:
    "Mahjong solitaire with large, readable Chinese tiles, tap-to-match, hints, shuffle, and undo. Every game can be cleared. Works offline.",
  title: "Mahjong",
};

const MahjongPage = () => <MahjongGame />;

export default MahjongPage;
