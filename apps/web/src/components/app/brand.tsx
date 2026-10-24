/** A connecting rod and its two pivot pins: LifeLink as a simple, useful mechanism. */
const BrandMark = ({ size = 40 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    className="shrink-0"
    height={size}
    viewBox="0 0 44 44"
    width={size}
  >
    <path
      d="M12 34 34 12"
      fill="none"
      stroke="var(--brass)"
      strokeLinecap="round"
      strokeWidth="11"
    />
    <path
      d="M12 34 34 12"
      fill="none"
      stroke="var(--accent-ink)"
      strokeLinecap="round"
      strokeWidth="7"
    />
    <circle
      cx="12"
      cy="34"
      fill="var(--surface)"
      r="6"
      stroke="var(--accent-ink)"
      strokeWidth="2.5"
    />
    <circle
      cx="34"
      cy="12"
      fill="var(--surface)"
      r="6"
      stroke="var(--accent-ink)"
      strokeWidth="2.5"
    />
    <path
      d="M9.5 34h5M31.5 12h5"
      stroke="var(--brass-ink)"
      strokeLinecap="round"
      strokeWidth="2"
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
    <BrandMark size={compact ? 32 : 40} />
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
