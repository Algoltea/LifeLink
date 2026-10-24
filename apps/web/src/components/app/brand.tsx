const PERSON_HOOK =
  "M298 105C326 77 368 77 397 104C426 131 429 176 401 208L332 282C309 307 297 334 298 363C298 395 311 424 333 447C354 469 383 481 414 482C447 483 475 470 499 446L566 373C591 345 630 343 657 366C684 391 688 431 662 461L485 645C454 678 414 694 369 695C321 696 276 680 241 645L142 543C105 505 85 458 85 409C84 359 102 313 133 277Z";

const LIFELINK_HOOK =
  "M549 132C580 101 619 84 661 84C708 82 751 99 784 132L880 234C920 277 941 328 941 380C941 432 922 477 886 516L731 674C705 700 661 703 632 678C602 652 596 611 618 579C622 573 627 568 632 562L698 493C720 470 732 444 732 413C731 381 718 352 695 330C673 309 645 297 615 298C583 298 557 311 536 333L465 409C440 437 399 438 371 412C344 388 342 347 363 320C367 314 372 309 377 304Z";

/** The approved Reach orange; it reads on both the light and dark grounds. */
const LIFELINK_ORANGE = "#cb6527";

const MARK_ASPECT = 1.4;

/**
 * Reach: two hooks clasped together. The ink hook is the person and follows
 * the theme's text color; the orange hook is LifeLink. `size` sets the
 * height; the mark is 1.4× as wide.
 */
const BrandMark = ({ size = 32 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    className="shrink-0"
    height={size}
    viewBox="85 84 856 612"
    width={Math.round(size * MARK_ASPECT)}
  >
    <path d={PERSON_HOOK} fill="var(--text)" />
    <path d={LIFELINK_HOOK} fill={LIFELINK_ORANGE} />
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
