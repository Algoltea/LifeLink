import type { SVGAttributes } from "react";

/**
 * Sidebar icons lucide has no good picture for, drawn on its 24px grid with
 * round caps so they sit beside the lucide icons. Geometry matches the Paper
 * board "LifeLink — Game icons".
 */
type NavIconProps = SVGAttributes<SVGSVGElement>;

const SPADE_PIP =
  "M5 9c-1.5 1.5-3 3.2-3 5.5A5.5 5.5 0 0 0 7.5 20c1.8 0 3-.5 4.5-2 1.5 1.5 2.7 2 4.5 2a5.5 5.5 0 0 0 5.5-5.5c0-2.3-1.5-4-3-5.5l-7-7-7 7Z M12 15.5L15.2 22.5H8.8Z";

const HEART =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";

const iconAttributes = {
  fill: "none",
  height: 24,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
  viewBox: "0 0 24 24",
  width: 24,
  xmlns: "http://www.w3.org/2000/svg",
} as const;

/** Two fanned playing cards, a spade on the front one. */
const SolitaireIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    {/* The back card stops where the front card covers it. */}
    <path d="M6.52 19.02A2 2 0 0 1 4.58 17.37L2.59 6.04A2 2 0 0 1 4.21 3.73L11.1 2.51A2 2 0 0 1 13.26 3.63" />
    <rect
      height="15.5"
      rx="2"
      transform="rotate(8 14.5 13.25)"
      width="11"
      x="9"
      y="5.5"
    />
    <path
      d={SPADE_PIP}
      fill="currentColor"
      stroke="none"
      transform="rotate(8 14.5 13.25) translate(14.5 13.1) scale(0.3) translate(-12 -12)"
    />
  </svg>
);

/** A standing tile with the red dragon, 中, on its face. */
const MahjongIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    <rect height="19" rx="2.5" width="14" x="5" y="2.5" />
    <path d="M5 17.5h14" />
    <rect height="4.5" rx="0.75" width="7" x="8.5" y="7.25" />
    <path d="M12 5v10" />
  </svg>
);

/**
 * A speech bubble cut like a Victorian label, concave corners and a swash
 * tail, with a printer's ornament where the words go.
 */
const AskIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    <path d="M5.5 4H18.5A2.5 2.5 0 0 0 21 6.5V14A2.5 2.5 0 0 0 18.5 16.5H11.5C10 18.25 8.25 19.75 5.75 20.75C6.75 19.5 7.25 18 7.25 16.5H5.5A2.5 2.5 0 0 0 3 14V6.5A2.5 2.5 0 0 0 5.5 4Z" />
    <path d="M6.5 10.25H8.25M15.75 10.25H17.5" />
    <path d="M12 8.75L13.4 10.25L12 11.75L10.6 10.25Z" fill="currentColor" />
  </svg>
);

/**
 * The brand's two clasped hooks as a line: the person's hook and LifeLink's,
 * coupled the way a connected account is.
 */
const ConnectionsIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    <path d="M7.94 6.06L4.76 9.24A4.62 4.62 0 0 0 11.3 15.77L14.48 12.59" />
    <path d="M9.52 11.4L12.7 8.23A4.62 4.62 0 0 1 19.24 14.76L16.06 17.94" />
  </svg>
);

/** The sun coming up over the horizon, for the day ahead. */
const TodayIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    <path d="M2 15H22M6 19H18" />
    <path d="M6.5 15A5.5 5.5 0 0 1 17.5 15" />
    <path d="M12 7.75V5M6.87 9.87L4.93 7.93M17.13 9.87L19.07 7.93" />
  </svg>
);

/**
 * A written page with a folded corner and a wax seal, so the person's papers
 * read as papers rather than a folder on a computer desktop.
 */
const DocumentsIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    {/* The page's edge stops where the seal covers its corner. */}
    <path d="M12.5 21.5H6.5A2 2 0 0 1 4.5 19.5V4.5A2 2 0 0 1 6.5 2.5H14.5L19.5 7.5V12.5" />
    <path d="M14.5 2.5V6.5A1 1 0 0 0 15.5 7.5H19.5" />
    <path d="M8 10H12M8 13.5H13.5" />
    <circle cx="17" cy="17.75" r="3.25" />
    <path d="M15.5 21.25L14.75 23M18.5 21.25L19.25 23" />
  </svg>
);

/**
 * A woven basket with an apple and a loaf in it: a rolled rim, a rounded belly
 * and a staggered weave, so it reads as wicker rather than a wire shop basket.
 */
const GroceriesIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    {/* The loaf and the apple stop at the rim, which hides the rest of them. */}
    <path d="M13.25 11L16.6 3.8A1.75 1.75 0 0 1 19.8 5.3L17.1 11" />
    <path d="M7.1 11A3 3 0 1 1 11.4 11" />
    <path d="M9.25 5.5L10 4" />
    <rect height="2.75" rx="1.375" width="19" x="2.5" y="11" />
    <path d="M4 13.75C4.4 17.85 5.75 20.5 8.25 20.5H15.75C18.25 20.5 19.6 17.85 20 13.75" />
    <path d="M4.75 17.1H19.25" />
    <path d="M9.5 13.75V17.1M14.5 13.75V17.1M12 17.1V20.5" />
  </svg>
);

/** Three people on a ring around a heart. */
const TrustedCircleIcon = (props: NavIconProps) => (
  <svg {...iconAttributes} {...props}>
    <path d="M15.46 4.23A8.5 8.5 0 0 1 20.45 12.89M17 18.88A8.5 8.5 0 0 1 7 18.88M3.55 12.89A8.5 8.5 0 0 1 8.54 4.23" />
    <circle cx="12" cy="3.5" fill="currentColor" r="1.5" />
    <circle cx="19.36" cy="16.25" fill="currentColor" r="1.5" />
    <circle cx="4.64" cy="16.25" fill="currentColor" r="1.5" />
    <path
      d={HEART}
      fill="currentColor"
      stroke="none"
      transform="translate(12 12.4) scale(0.42) translate(-12 -12)"
    />
  </svg>
);

export {
  AskIcon,
  ConnectionsIcon,
  DocumentsIcon,
  GroceriesIcon,
  MahjongIcon,
  SolitaireIcon,
  TodayIcon,
  TrustedCircleIcon,
};
