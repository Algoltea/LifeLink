/*
 * Mahjong needs a tablet-sized screen so its tiles are large enough to tap.
 * Phones are recognised by their short side: under 640px wide when upright,
 * or under 480px tall when turned sideways. An iPad mini (744px) qualifies.
 */

/** Media query for screens that can show the Mahjong board. */
export const MAHJONG_SCREEN = "(min-width: 40rem) and (min-height: 30rem)";

/** Hides links to Mahjong on phones, matching MAHJONG_SCREEN. */
export const HIDE_ON_PHONES =
  "max-sm:hidden [@media(max-height:29.99rem)]:hidden";
