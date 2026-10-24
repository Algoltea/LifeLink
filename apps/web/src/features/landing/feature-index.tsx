"use client";

import { cn } from "@lifelink/ui/lib/utils";
import { useState } from "react";

import { MORE_FEATURES } from "./content";
import { FEATURE_PREVIEWS } from "./feature-previews";
import { HEADING, PAGE } from "./parts";
import { Reveal } from "./reveal";

const FIRST_FEATURE = MORE_FEATURES[0]?.id ?? "email";

const Preview = ({ id }: { id: string }) => {
  const content = FEATURE_PREVIEWS.get(id);

  if (!content) {
    return null;
  }

  return (
    <div className="motion-enter" data-ui="feature-preview" key={id}>
      {content}
    </div>
  );
};

/**
 * Index with preview: pointing at or choosing a row shows that part of
 * LifeLink in one fixed frame. On phones the example opens under its row.
 */
const FeatureIndex = () => {
  const [activeId, setActiveId] = useState(FIRST_FEATURE);

  return (
    <section
      aria-labelledby="everything-else-title"
      className="bg-background py-[5.333rem] lg:py-[10rem]"
    >
      <div
        className={`${PAGE} grid gap-[2.222rem] lg:grid-cols-[minmax(0,1fr)_28.889rem] lg:gap-[3rem]`}
      >
        <div className="flex flex-col gap-[2.222rem]">
          <Reveal>
            <h2 className={HEADING} id="everything-else-title">
              Everything else
              <br />
              it does
            </h2>
          </Reveal>
          <ul className="flex flex-col gap-[0.222rem]">
            {MORE_FEATURES.map((feature, index) => {
              const active = feature.id === activeId;

              return (
                <Reveal as="li" delay={index * 50} key={feature.id}>
                  <button
                    aria-pressed={active}
                    className={cn(
                      "flex w-full flex-col gap-[0.222rem] px-[1.111rem] py-[0.889rem] text-left transition-colors duration-200",
                      active ? "bg-parchment" : "hover:bg-parchment/60"
                    )}
                    onClick={() => setActiveId(feature.id)}
                    onFocus={() => setActiveId(feature.id)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        setActiveId(feature.id);
                      }
                    }}
                    type="button"
                  >
                    <span
                      className={cn(
                        "text-[1.111rem] leading-[1.4] font-semibold md:text-[1.333rem]",
                        active && "text-accent-foreground"
                      )}
                    >
                      {feature.name}
                    </span>
                    <span className="text-[0.944rem] leading-[1.5] md:text-[1rem]">
                      {feature.summary}
                    </span>
                  </button>
                  {active ? (
                    <div className="bg-parchment px-[0.889rem] pb-[0.889rem] lg:hidden">
                      <Preview id={feature.id} />
                    </div>
                  ) : null}
                </Reveal>
              );
            })}
          </ul>
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-[2.222rem] flex flex-col gap-[0.667rem] pt-[9.333rem]">
            <Preview id={activeId} />
            <p className="text-muted-foreground text-[0.889rem] leading-[1.5]">
              Example. Point at a row to see that part of LifeLink here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FeatureIndex };
