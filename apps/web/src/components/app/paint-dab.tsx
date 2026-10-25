import { cn } from "@lifelink/ui/lib/utils";

/** Three hand-painted shapes, each with its own pastel in `index.css`. */
const DAB_PATHS = [
  "M2.2 6.8C1.2 5.4 2.6 2.6 5.4 2.1c2.6-.5 4.9.6 4.6 2.3-.3 1.9-2.6 3.4-4.9 3.6-1.3.1-2.3-.3-2.9-1.2z",
  "M1.8 4.6C2.3 2.7 4.8 1.6 7.3 2.2c2.3.6 3.4 2.4 2.5 3.8-1 1.5-3.6 2.2-5.6 1.7C2.6 7.3 1.5 6 1.8 4.6z",
  "M2.4 3.4c1.3-1.6 4.3-1.9 6.2-.8 1.8 1 1.9 2.9.4 4-1.6 1.2-4.4 1.4-6 .5-1.4-.8-1.6-2.4-.6-3.7z",
] as const;

/**
 * A small painted dab, the separator between Today's market quotes and the
 * receipt's aisles. The index cycles through the shapes and colors.
 */
const PaintDab = ({
  className,
  index,
}: {
  className?: string;
  index: number;
}) => {
  const stroke = index % DAB_PATHS.length;

  return (
    <svg
      aria-hidden="true"
      className={cn("paint-dab shrink-0", className)}
      data-dab={stroke}
      height="10"
      viewBox="0 0 12 10"
      width="12"
    >
      <path d={DAB_PATHS[stroke]} />
    </svg>
  );
};

export { PaintDab };
