const INK_HOOK =
  "M16.16 5.33 7.32 14.17a6.5 6.5 0 0 0 0 9.19l8.48 8.48a6.5 6.5 0 0 0 9.19 0L35.6 21.24";

const COPPER_HOOK =
  "M39.84 34.67 48.68 25.83a6.5 6.5 0 0 0 0-9.19L40.2 8.16a6.5 6.5 0 0 0-9.19 0L20.4 18.76";

const MARK_ASPECT = 1.4;

/**
 * Reach: two identical hooks clasped together. The ink hook is the person,
 * the copper hook is LifeLink. `size` sets the height; the mark is 1.4× wide.
 */
const BrandMark = ({ size = 32 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    className="shrink-0"
    fill="none"
    height={size}
    viewBox="0 0 56 40"
    width={Math.round(size * MARK_ASPECT)}
  >
    <path
      d={INK_HOOK}
      stroke="var(--text)"
      strokeLinecap="round"
      strokeWidth="10"
    />
    <path
      d={COPPER_HOOK}
      stroke="var(--accent-ink)"
      strokeLinecap="round"
      strokeWidth="10"
    />
  </svg>
);

const BrandName = ({
  compact = false,
  subtitle,
}: {
  compact?: boolean;
  subtitle?: string;
}) => (
  <span
    className={
      compact ? "flex items-center gap-[8px]" : "flex items-center gap-3"
    }
  >
    <BrandMark size={compact ? 28 : 32} />
    <span className="flex flex-col">
      <span className="text-section leading-tight font-semibold tracking-tight">
        LifeLink
      </span>
      {subtitle ? (
        <span className="text-muted-foreground text-label">{subtitle}</span>
      ) : null}
    </span>
  </span>
);

export { BrandMark, BrandName };
