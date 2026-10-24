import { cn } from "@lifelink/ui/lib/utils";

/**
 * Isometric "typewriter key" icons: what a connection can do, what kind of
 * file a document is, and who is in the trusted circle. Each object sits on
 * the same round key, drawn at one angle with one ink line. Paints map to
 * theme tokens so the set follows light, dark, and more-contrast themes.
 * Geometry matches the Paper board "Connections cards — Permission icons
 * (isometric set)"; the trusted shield is on "Trusted circle v2 — trusted key icon".
 */
type IsoIconKind =
  | "add"
  | "calendar"
  | "document"
  | "draft"
  | "file"
  | "folder"
  | "message"
  | "money"
  | "notice"
  | "pdf"
  | "post"
  | "read"
  | "replies"
  | "send"
  | "slides"
  | "spreadsheet"
  | "trusted"
  | "unavailable";

type Paint =
  | "border"
  | "brass"
  | "brassInk"
  | "caution"
  | "control"
  | "copper"
  | "ink"
  | "muted"
  | "none"
  | "paper"
  | "parchment"
  | "wash";

interface IconFacet {
  readonly d: string;
  readonly dashed?: boolean;
  readonly fill?: Paint;
  readonly stroke?: Paint;
  readonly width?: number;
}

const PAINT: Record<Paint, string> = {
  border: "var(--border)",
  brass: "var(--brass)",
  brassInk: "var(--brass-ink)",
  caution: "var(--warning-wash)",
  control: "var(--control)",
  copper: "var(--accent-ink)",
  ink: "var(--text)",
  muted: "var(--muted-text)",
  none: "none",
  paper: "var(--surface)",
  parchment: "var(--parchment)",
  wash: "var(--neutral-wash)",
};

const LINE_WIDTH = 1.4;

const KEY_BASE: readonly IconFacet[] = [
  {
    d: "M55 45L54.2 48.4L51.9 51.6L48.2 54.4L43.5 56.5L37.9 57.8L32 58.3L26.1 57.8L20.5 56.5L15.8 54.4L12.1 51.6L9.8 48.4L9 45L9 40L9.8 43.4L12.1 46.6L15.8 49.4L20.5 51.5L26.1 52.8L32 53.3L37.9 52.8L43.5 51.5L48.2 49.4L51.9 46.6L54.2 43.4L55 40Z",
    fill: "border",
    stroke: "ink",
  },
  {
    d: "M48.2 49.4L43.5 51.5L37.9 52.8L32 53.3L26.1 52.8L20.5 51.5L15.8 49.4L12.1 46.6L9.8 43.4L9 40L9.8 36.6L12.1 33.4L15.8 30.6L20.5 28.5L26.1 27.2L32 26.7L37.9 27.2L43.5 28.5L48.2 30.6L51.9 33.4L54.2 36.6L55 40L54.2 43.4L51.9 46.6Z",
    fill: "wash",
    stroke: "ink",
  },
];

const FACETS: Record<IsoIconKind, readonly IconFacet[]> = {
  add: [
    {
      d: "M20.1 35.6L39.6 46.9L39.6 28.1L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M43.9 44.4L39.6 46.9L39.6 28.1L43.9 25.6Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 14.4L43.9 25.6L39.6 28.1L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M20.1 16.9L39.6 28.1L39.6 23.1L20.1 11.9Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M43.9 25.6L39.6 28.1L39.6 23.1L43.9 20.6Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M24.4 9.4L43.9 20.6L39.6 23.1L20.1 11.9Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M25.5 15L27.1 15.9L27.1 10.9L25.5 10Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M28.2 15.3L27.1 15.9L27.1 10.9L28.2 10.3Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M26.6 9.4L28.2 10.3L27.1 10.9L25.5 10Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M35.8 20.9L37.4 21.9L37.4 16.9L35.8 15.9Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M38.5 21.3L37.4 21.9L37.4 16.9L38.5 16.3Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L38.5 16.3L37.4 16.9L35.8 15.9Z",
      fill: "brass",
      stroke: "ink",
    },
    { d: "M29.8 37.5L29.8 25.6", fill: "none", stroke: "copper", width: 2.6 },
    { d: "M24.6 28.6L35 34.6", fill: "none", stroke: "copper", width: 2.6 },
  ],
  calendar: [
    {
      d: "M20.1 35.6L39.6 46.9L39.6 28.1L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M43.9 44.4L39.6 46.9L39.6 28.1L43.9 25.6Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 14.4L43.9 25.6L39.6 28.1L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M20.1 16.9L39.6 28.1L39.6 23.1L20.1 11.9Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M43.9 25.6L39.6 28.1L39.6 23.1L43.9 20.6Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M24.4 9.4L43.9 20.6L39.6 23.1L20.1 11.9Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M25.5 15L27.1 15.9L27.1 10.9L25.5 10Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M28.2 15.3L27.1 15.9L27.1 10.9L28.2 10.3Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M26.6 9.4L28.2 10.3L27.1 10.9L25.5 10Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M35.8 20.9L37.4 21.9L37.4 16.9L35.8 15.9Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M38.5 21.3L37.4 21.9L37.4 16.9L38.5 16.3Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L38.5 16.3L37.4 16.9L35.8 15.9Z",
      fill: "brass",
      stroke: "ink",
    },
    { d: "M22.3 24.4L37.4 33.1", fill: "none", stroke: "border", width: 1.2 },
    { d: "M22.3 30L37.4 38.8", fill: "none", stroke: "border", width: 1.2 },
    { d: "M27.1 37.2L27.1 23.4", fill: "none", stroke: "border", width: 1.2 },
    { d: "M32.5 40.3L32.5 26.6", fill: "none", stroke: "border", width: 1.2 },
    {
      d: "M33 35.6L37 37.9L37 33.5L33 31.2Z",
      fill: "copper",
      stroke: "copper",
      width: 0.6,
    },
    {
      d: "M22.7 24L26.7 26.3L26.7 23.2L22.7 20.9Z",
      fill: "brass",
      stroke: "brass",
      width: 0.6,
    },
  ],
  document: [
    {
      d: "M41.7 44.4L39.6 45.6L39.6 25L41.7 23.8Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 8.1L36.9 15.3L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L41.7 23.8L39.6 25L34.7 16.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M22.3 35.6L39.6 45.6L39.6 25L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M34.7 16.6L34.7 22.2L39.6 25Z", fill: "wash", stroke: "ink" },
    { d: "M25 16.6L32.5 20.9", fill: "none", stroke: "copper", width: 1.8 },
    { d: "M25 21.6L36.9 28.4", fill: "none", stroke: "ink" },
    { d: "M25 25.9L36.9 32.8", fill: "none", stroke: "ink" },
    { d: "M25 30.3L33.6 35.3", fill: "none", stroke: "ink" },
  ],
  draft: [
    {
      d: "M12.5 41.3L29.8 51.3L29.8 49.8L12.5 39.8Z",
      fill: "wash",
      stroke: "ink",
    },
    {
      d: "M51.5 38.8L29.8 51.3L29.8 49.8L51.5 37.3Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M34.2 27.3L51.5 37.3L29.8 49.8L12.5 39.8Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M34.2 31L45 37.3", fill: "none", stroke: "ink" },
    { d: "M30.9 32.9L41.7 39.1", fill: "none", stroke: "ink" },
    { d: "M27.7 34.8L34.2 38.5", fill: "none", stroke: "ink" },
    {
      d: "M13.6 35.4L16.8 37.3L16.8 33.5L13.6 31.6Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M20.1 35.4L16.8 37.3L16.8 33.5L20.1 31.6Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M16.8 29.8L20.1 31.6L16.8 33.5L13.6 31.6Z",
      fill: "brass",
      stroke: "ink",
    },
    { d: "M16.8 37.3L32 46L32 42.3L16.8 33.5Z", fill: "copper", stroke: "ink" },
    { d: "M35.2 44.1L32 46L32 42.3L35.2 40.4Z", fill: "copper", stroke: "ink" },
    {
      d: "M20.1 31.6L35.2 40.4L32 42.3L16.8 33.5Z",
      fill: "copper",
      stroke: "ink",
    },
    { d: "M32 46L32 42.3L38.5 46Z", fill: "paper", stroke: "ink" },
    { d: "M35.2 40.4L32 42.3L38.5 46Z", fill: "paper", stroke: "ink" },
  ],
  file: [
    {
      d: "M41.7 44.4L39.6 45.6L39.6 25L41.7 23.8Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 8.1L36.9 15.3L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L41.7 23.8L39.6 25L34.7 16.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M22.3 35.6L39.6 45.6L39.6 25L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M34.7 16.6L34.7 22.2L39.6 25Z", fill: "wash", stroke: "ink" },
    { d: "M25 21.6L36.9 28.4", fill: "none", stroke: "muted" },
    { d: "M25 25.9L33.6 30.9", fill: "none", stroke: "muted" },
  ],
  folder: [
    {
      d: "M22.8 12.2L30.4 16.6L30.4 13.4L22.8 9.1Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M31.5 15.9L30.4 16.6L30.4 13.4L31.5 12.8Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M23.9 8.4L31.5 12.8L30.4 13.4L22.8 9.1Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M22.8 32.8L44.4 45.3L44.4 24.7L22.8 12.2Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M45.5 44.7L44.4 45.3L44.4 24.7L45.5 24.1Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M23.9 11.6L45.5 24.1L44.4 24.7L22.8 12.2Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M24.4 35.6L39.6 44.4L39.6 20L24.4 11.3Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M40.7 43.8L39.6 44.4L39.6 20L40.7 19.4Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M25.5 10.6L40.7 19.4L39.6 20L24.4 11.3Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M26.6 15.6L34.2 20", fill: "none", stroke: "ink", width: 1.2 },
    {
      d: "M18.5 35.3L40.1 47.8L40.1 30.3L18.5 17.8Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M42.3 46.6L40.1 47.8L40.1 30.3L42.3 29.1Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M20.6 16.6L42.3 29.1L40.1 30.3L18.5 17.8Z",
      fill: "caution",
      stroke: "ink",
    },
    { d: "M26.6 27.5L32 30.6", fill: "none", stroke: "brassInk", width: 1.8 },
  ],
  message: [
    { d: "M19 27.5L40.7 40L40.7 23.8L19 11.3Z", fill: "copper", stroke: "ink" },
    { d: "M45 37.5L40.7 40L40.7 23.8L45 21.3Z", fill: "copper", stroke: "ink" },
    {
      d: "M23.3 8.8L45 21.3L40.7 23.8L19 11.3Z",
      fill: "copper",
      stroke: "ink",
    },
    { d: "M27.7 32.5L21.2 34.4L23.3 30Z", fill: "copper", stroke: "ink" },
    { d: "M23.3 19.4L36.3 26.9", fill: "none", stroke: "paper", width: 1.6 },
    { d: "M23.3 24.4L32.5 29.7", fill: "none", stroke: "paper", width: 1.6 },
  ],
  money: [
    {
      d: "M40.6 40L40.2 41.6L39.1 43.1L37.4 44.4L35.2 45.4L32.6 46L29.8 46.2L27.1 46L24.5 45.4L22.3 44.4L20.6 43.1L19.5 41.6L19.1 40L19.1 36.8L19.5 38.4L20.6 39.8L22.3 41.1L24.5 42.1L27.1 42.7L29.8 42.9L32.6 42.7L35.2 42.1L37.4 41.1L39.1 39.8L40.2 38.4L40.6 36.8Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M37.4 41.1L35.2 42.1L32.6 42.7L29.8 42.9L27.1 42.7L24.5 42.1L22.3 41.1L20.6 39.8L19.5 38.4L19.1 36.8L19.5 35.1L20.6 33.7L22.3 32.4L24.5 31.4L27.1 30.8L29.8 30.6L32.6 30.8L35.2 31.4L37.4 32.4L39.1 33.7L40.2 35.1L40.6 36.8L40.2 38.4L39.1 39.8Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M41.9 36.8L41.5 38.4L40.4 39.8L38.7 41.1L36.5 42.1L33.9 42.7L31.1 42.9L28.4 42.7L25.8 42.1L23.6 41.1L21.9 39.8L20.8 38.4L20.4 36.8L20.4 33.5L20.8 35.1L21.9 36.6L23.6 37.9L25.8 38.9L28.4 39.5L31.1 39.7L33.9 39.5L36.5 38.9L38.7 37.9L40.4 36.6L41.5 35.1L41.9 33.5Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M38.7 37.9L36.5 38.9L33.9 39.5L31.1 39.7L28.4 39.5L25.8 38.9L23.6 37.9L21.9 36.6L20.8 35.1L20.4 33.5L20.8 31.9L21.9 30.4L23.6 29.1L25.8 28.1L28.4 27.5L31.1 27.3L33.9 27.5L36.5 28.1L38.7 29.1L40.4 30.4L41.5 31.9L41.9 33.5L41.5 35.1L40.4 36.6Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M43.6 33.5L43.2 35.1L42.1 36.6L40.4 37.9L38.2 38.9L35.6 39.5L32.9 39.7L30.1 39.5L27.5 38.9L25.3 37.9L23.6 36.6L22.5 35.1L22.1 33.5L22.1 30.3L22.5 31.9L23.6 33.3L25.3 34.6L27.5 35.6L30.1 36.2L32.9 36.4L35.6 36.2L38.2 35.6L40.4 34.6L42.1 33.3L43.2 31.9L43.6 30.3Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M40.4 34.6L38.2 35.6L35.6 36.2L32.9 36.4L30.1 36.2L27.5 35.6L25.3 34.6L23.6 33.3L22.5 31.9L22.1 30.3L22.5 28.6L23.6 27.2L25.3 25.9L27.5 24.9L30.1 24.3L32.9 24.1L35.6 24.3L38.2 24.9L40.4 25.9L42.1 27.2L43.2 28.6L43.6 30.3L43.2 31.9L42.1 33.3Z",
      fill: "caution",
      stroke: "ink",
    },
    {
      d: "M36.8 32.5L35 33.2L32.9 33.4L30.8 33.2L29 32.5L27.8 31.5L27.4 30.3L27.8 29L29 28L30.8 27.3L32.9 27.1L35 27.3L36.8 28L38 29L38.4 30.3L38 31.5Z",
      fill: "none",
      stroke: "brassInk",
      width: 1.2,
    },
    {
      d: "M40.1 50.3L39.8 51.3L39.2 52.2L38.2 52.9L36.8 53.5L35.3 53.9L33.6 54L32 53.9L30.4 53.5L29.1 52.9L28.1 52.2L27.4 51.3L27.2 50.3L27.2 47.3L27.4 48.3L28.1 49.2L29.1 49.9L30.4 50.5L32 50.9L33.6 51L35.3 50.9L36.8 50.5L38.2 49.9L39.2 49.2L39.8 48.3L40.1 47.3Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M38.2 49.9L36.8 50.5L35.3 50.9L33.6 51L32 50.9L30.4 50.5L29.1 49.9L28.1 49.2L27.4 48.3L27.2 47.3L27.4 46.4L28.1 45.5L29.1 44.7L30.4 44.1L32 43.7L33.6 43.6L35.3 43.7L36.8 44.1L38.2 44.7L39.2 45.5L39.8 46.4L40.1 47.3L39.8 48.3L39.2 49.2Z",
      fill: "caution",
      stroke: "ink",
    },
  ],
  notice: [
    {
      d: "M28.8 40L32 41.9L32 30.6L28.8 28.8Z",
      fill: "control",
      stroke: "ink",
    },
    { d: "M35.2 40L32 41.9L32 30.6L35.2 28.8Z", fill: "muted", stroke: "ink" },
    {
      d: "M32 26.9L35.2 28.8L32 30.6L28.8 28.8Z",
      fill: "control",
      stroke: "ink",
    },
    {
      d: "M16.8 31.3L27.7 37.5L27.7 27.5L16.8 21.3Z",
      fill: "wash",
      stroke: "ink",
    },
    {
      d: "M47.2 26.3L27.7 37.5L27.7 27.5L47.2 16.3Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M36.3 10L47.2 16.3L27.7 27.5L16.8 21.3Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M19 30.6L25.5 34.4L25.5 28.8L19 25Z", fill: "wash", stroke: "ink" },
    { d: "M21 29.3L23.6 30.8", fill: "none", stroke: "ink", width: 1.6 },
    {
      d: "M39.4 28.3L40.4 28.9L40.4 13.9L39.4 13.3Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M41.7 28.1L40.4 28.9L40.4 13.9L41.7 13.1Z",
      fill: "brassInk",
      stroke: "ink",
    },
    {
      d: "M40.7 12.5L41.7 13.1L40.4 13.9L39.4 13.3Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M40.7 17.5L41.7 18.1L41.7 13.1L40.7 12.5Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M47.2 15L41.7 18.1L41.7 13.1L47.2 10Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M46.1 9.4L47.2 10L41.7 13.1L40.7 12.5Z",
      fill: "copper",
      stroke: "ink",
    },
  ],
  pdf: [
    {
      d: "M41.7 44.4L39.6 45.6L39.6 25L41.7 23.8Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 8.1L36.9 15.3L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L41.7 23.8L39.6 25L34.7 16.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M22.3 35.6L39.6 45.6L39.6 25L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M34.7 16.6L34.7 22.2L39.6 25Z", fill: "wash", stroke: "ink" },
    {
      d: "M24.4 33.8L37.4 41.3L37.4 35L24.4 27.5Z",
      fill: "copper",
      stroke: "copper",
      width: 0.6,
    },
    { d: "M25 16.6L32.5 20.9", fill: "none", stroke: "ink" },
    { d: "M25 21.6L36.9 28.4", fill: "none", stroke: "ink" },
    { d: "M27.1 32.2L34.7 36.6", fill: "none", stroke: "paper", width: 1.6 },
  ],
  post: [
    {
      d: "M20.6 35.3L40.1 46.6L40.1 22.8L20.6 11.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M43.4 44.7L40.1 46.6L40.1 22.8L43.4 20.9Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M23.9 9.7L43.4 20.9L40.1 22.8L20.6 11.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M22.8 34.1L38 42.8L38 24.1L22.8 15.3Z",
      fill: "parchment",
      stroke: "ink",
    },
    {
      d: "M22.8 34.1L28.2 27.2L32 35L34.2 33.1L38 42.8Z",
      fill: "copper",
      stroke: "copper",
      width: 0.8,
    },
    {
      d: "M36.5 28.3L36.4 27.1L35.8 25.9L35.1 24.9L34.2 24.1L33.3 23.8L32.5 24L32 24.6L31.8 25.5L32 26.7L32.5 27.8L33.3 28.9L34.2 29.6L35.1 29.9L35.8 29.8L36.4 29.2Z",
      fill: "brass",
      stroke: "brass",
      width: 0.6,
    },
  ],
  read: [
    {
      d: "M13.6 38.1L35.2 50.6L35.2 47.5L13.6 35Z",
      fill: "wash",
      stroke: "ink",
    },
    {
      d: "M50.4 41.9L35.2 50.6L35.2 47.5L50.4 38.8Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M28.8 26.3L50.4 38.8L35.2 47.5L13.6 35Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M27.1 30.9L42.3 39.7L42.3 20.9L27.1 12.2Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M43.9 38.8L42.3 39.7L42.3 20.9L43.9 20Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M28.8 11.3L43.9 20L42.3 20.9L27.1 12.2Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M29.8 18.1L38 22.8", fill: "none", stroke: "copper", width: 1.8 },
    { d: "M29.8 22.5L39.6 28.1", fill: "none", stroke: "ink" },
    { d: "M29.8 26.3L36.9 30.3", fill: "none", stroke: "ink" },
    { d: "M21.2 30.6L17.4 37.2", fill: "none", stroke: "ink" },
    { d: "M42.8 43.1L31.5 45.3", fill: "none", stroke: "ink" },
  ],
  replies: [
    { d: "M19 27.5L40.7 40L40.7 23.8L19 11.3Z", fill: "paper", stroke: "ink" },
    { d: "M45 37.5L40.7 40L40.7 23.8L45 21.3Z", fill: "border", stroke: "ink" },
    { d: "M23.3 8.8L45 21.3L40.7 23.8L19 11.3Z", fill: "paper", stroke: "ink" },
    { d: "M27.7 32.5L21.2 34.4L23.3 30Z", fill: "paper", stroke: "ink" },
    { d: "M23.3 19.4L36.3 26.9", fill: "none", stroke: "ink", width: 1.6 },
    { d: "M23.3 24.4L32.5 29.7", fill: "none", stroke: "ink", width: 1.6 },
  ],
  send: [
    {
      d: "M13.6 38.1L35.2 50.6L35.2 46.9L13.6 34.4Z",
      fill: "wash",
      stroke: "ink",
    },
    {
      d: "M50.4 41.9L35.2 50.6L35.2 46.9L50.4 38.1Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M28.8 25.6L50.4 38.1L35.2 46.9L13.6 34.4Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M28.8 25.6L30.9 36.9L50.4 38.1", fill: "none", stroke: "ink" },
    {
      d: "M34.8 39.1L33.4 39.7L31.8 40L30.1 40L28.4 39.7L27 39.1L26 38.3L25.5 37.4L25.5 36.4L26 35.4L27 34.6L28.4 34L30.1 33.7L31.8 33.7L33.4 34L34.8 34.6L35.8 35.4L36.4 36.4L36.4 37.4L35.8 38.3Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M32.6 37.9L31.6 38.2L30.3 38.2L29.2 37.9L28.6 37.2L28.6 36.5L29.2 35.9L30.3 35.5L31.6 35.5L32.6 35.9L33.3 36.5L33.3 37.2Z",
      fill: "copper",
      stroke: "paper",
      width: 1,
    },
  ],
  slides: [
    {
      d: "M43.9 45.6L41.7 46.9L41.7 29.4L43.9 28.1Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M22.3 15.6L43.9 28.1L41.7 29.4L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M20.1 34.4L41.7 46.9L41.7 29.4L20.1 16.9Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M22.8 22.2L29.8 26.3", fill: "none", stroke: "copper", width: 1.8 },
    {
      d: "M23.9 33.4L27.1 35.3L27.1 30.9L23.9 29.1Z",
      fill: "brass",
      stroke: "ink",
      width: 1,
    },
    {
      d: "M29.3 36.6L32.5 38.4L32.5 30.9L29.3 29.1Z",
      fill: "copper",
      stroke: "ink",
      width: 1,
    },
    {
      d: "M34.7 39.7L38 41.6L38 38.4L34.7 36.6Z",
      fill: "brass",
      stroke: "ink",
      width: 1,
    },
  ],
  spreadsheet: [
    {
      d: "M41.7 44.4L39.6 45.6L39.6 25L41.7 23.8Z",
      fill: "border",
      stroke: "ink",
    },
    {
      d: "M24.4 8.1L36.9 15.3L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M36.9 15.3L41.7 23.8L39.6 25L34.7 16.6Z",
      fill: "paper",
      stroke: "ink",
    },
    {
      d: "M22.3 35.6L39.6 45.6L39.6 25L34.7 16.6L22.3 9.4Z",
      fill: "paper",
      stroke: "ink",
    },
    { d: "M34.7 16.6L34.7 22.2L39.6 25Z", fill: "wash", stroke: "ink" },
    {
      d: "M24.4 20.6L37.4 28.1L37.4 24.4L24.4 16.9Z",
      fill: "brass",
      stroke: "brass",
      width: 0.6,
    },
    { d: "M24.4 33.8L37.4 41.3", fill: "none", stroke: "ink", width: 1 },
    { d: "M24.4 29.4L37.4 36.9", fill: "none", stroke: "ink", width: 1 },
    { d: "M24.4 25L37.4 32.5", fill: "none", stroke: "ink", width: 1 },
    { d: "M24.4 20.6L37.4 28.1", fill: "none", stroke: "ink", width: 1 },
    { d: "M24.4 16.9L37.4 24.4", fill: "none", stroke: "ink", width: 1 },
    { d: "M24.4 33.8L24.4 16.9", fill: "none", stroke: "ink", width: 1 },
    { d: "M28.8 36.3L28.8 19.4", fill: "none", stroke: "ink", width: 1 },
    { d: "M33.1 38.8L33.1 21.9", fill: "none", stroke: "ink", width: 1 },
    { d: "M37.4 41.3L37.4 24.4", fill: "none", stroke: "ink", width: 1 },
    {
      d: "M33.4 34.2L37.1 36.3L37.1 32.7L33.4 30.6Z",
      fill: "copper",
      stroke: "copper",
      width: 0.6,
    },
  ],
  trusted: [
    {
      d: "M24.4 10.7L34.2 12.7L43.9 22L43.9 32.4L42.5 36.8L39.2 39.1L34.2 38.7L29.1 33.2L25.8 27.1L24.4 21.1Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M20.1 13.2L29.9 15.2L34.2 12.7L24.4 10.7Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M29.9 15.2L39.6 24.5L43.9 22L34.2 12.7Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M39.6 24.5L39.6 34.9L43.9 32.4L43.9 22Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M39.6 34.9L38.2 39.3L42.5 36.8L43.9 32.4Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M38.2 39.3L34.9 41.6L39.2 39.1L42.5 36.8Z",
      fill: "brass",
      stroke: "ink",
    },
    {
      d: "M20.1 13.2L29.9 15.2L39.6 24.5L39.6 34.9L38.2 39.3L34.9 41.6L29.9 41.2L24.8 35.7L21.5 29.6L20.1 23.6Z",
      fill: "copper",
      stroke: "ink",
    },
    {
      d: "M29.9 25L29.9 24.5L30.3 23.8L31.2 23.5L32.4 24.2L33.4 25.8L33.8 27.6L33.4 29L32.4 30L31.2 30.7L30.3 31.5L29.9 32.2L29.9 32.5L29.8 32.1L29.4 30.9L28.5 29.1L27.3 27.1L26.3 25L26 23.1L26.3 21.7L27.3 21.3L28.5 21.9L29.4 23.2L29.8 24.5L29.9 25Z",
      fill: "paper",
      stroke: "ink",
      width: 1,
    },
  ],
  unavailable: [
    {
      d: "M16.8 40L32 48.8L32 32.5L16.8 23.8Z",
      dashed: true,
      fill: "none",
      stroke: "control",
    },
    {
      d: "M47.2 40L32 48.8L32 32.5L47.2 23.8Z",
      dashed: true,
      fill: "none",
      stroke: "control",
    },
    {
      d: "M32 15L47.2 23.8L32 32.5L16.8 23.8Z",
      dashed: true,
      fill: "none",
      stroke: "control",
    },
  ],
};

const KIND_BY_CAPABILITY = new Map<string, IsoIconKind>([
  ["calendar.create", "add"],
  ["calendar.read", "calendar"],
  ["discord.receive", "replies"],
  ["discord.send", "message"],
  ["drive.create", "add"],
  ["drive.read", "read"],
  ["ebay.search", "read"],
  ["ebay.selling", "money"],
  ["email.appointments", "calendar"],
  ["email.draft", "draft"],
  ["email.new_message_event", "notice"],
  ["email.read_selected", "read"],
  ["email.send", "send"],
  ["facebook.page_inbox", "replies"],
  ["facebook.page_post", "post"],
  ["imessage.delivery", "notice"],
  ["imessage.first_contact", "message"],
  ["imessage.receive", "replies"],
  ["imessage.send", "message"],
  ["instagram.messages", "replies"],
  ["instagram.post", "post"],
  ["paypal.invoices", "read"],
  ["paypal.send_money", "money"],
]);

const permissionIconFor = (capabilityId: string): IsoIconKind =>
  KIND_BY_CAPABILITY.get(capabilityId) ?? "unavailable";

/** Keyed by the file kinds the Drive listing reports. */
const KIND_BY_FILE_KIND = new Map<string, IsoIconKind>([
  ["Document", "document"],
  ["Folder", "folder"],
  ["PDF", "pdf"],
  ["Picture", "post"],
  ["Slides", "slides"],
  ["Spreadsheet", "spreadsheet"],
]);

const fileIconFor = (fileKind: string): IsoIconKind =>
  KIND_BY_FILE_KIND.get(fileKind) ?? "file";

const FacetPath = ({ facet }: { facet: IconFacet }) => (
  <path
    d={facet.d}
    fill={PAINT[facet.fill ?? "none"]}
    stroke={PAINT[facet.stroke ?? "ink"]}
    strokeDasharray={facet.dashed ? "2.5 2.5" : undefined}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={facet.width ?? LINE_WIDTH}
  />
);

/** Decorative: always pair it with words that say the same thing. */
const IsoIcon = ({
  className,
  kind,
  size = 56,
}: {
  className?: string;
  kind: IsoIconKind;
  size?: number;
}) => (
  <svg
    aria-hidden="true"
    className={cn("shrink-0", className)}
    height={size}
    viewBox="0 0 64 64"
    width={size}
  >
    {KEY_BASE.map((facet) => (
      <FacetPath key={facet.d} facet={facet} />
    ))}
    {FACETS[kind].map((facet) => (
      <FacetPath key={facet.d} facet={facet} />
    ))}
  </svg>
);

export { IsoIcon, fileIconFor, permissionIconFor };

export type { IsoIconKind };
