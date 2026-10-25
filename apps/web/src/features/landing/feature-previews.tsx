"use client";

import type { ReactNode } from "react";

import { useMessages } from "@/i18n/locale";

import type { FeatureId } from "./content";

/** Small, real-looking pieces of each LifeLink screen, filled with sample data. */

const Panel = ({
  children,
  title,
  note,
}: {
  children: ReactNode;
  note?: string;
  title: string;
}) => (
  <div className="bg-parchment text-foreground flex flex-col gap-[0.556rem] rounded-[0.667rem] p-[1.111rem] md:p-[1.333rem]">
    <div className="flex items-baseline justify-between gap-4 pb-[0.333rem]">
      <span className="text-[1.222rem] font-semibold">{title}</span>
      {note ? (
        <span className="text-muted-foreground text-[0.889rem]">{note}</span>
      ) : null}
    </div>
    {children}
  </div>
);

const Row = ({ children }: { children: ReactNode }) => (
  <div className="bg-raised flex flex-col gap-[0.222rem] rounded-[0.444rem] px-[1rem] py-[0.778rem] text-[0.944rem] leading-[1.5]">
    {children}
  </div>
);

const Pair = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span>{label}</span>
    <span className="num font-semibold">{value}</span>
  </div>
);

const Approve = ({ children }: { children: string }) => (
  <span className="bg-primary text-primary-foreground mt-[0.333rem] flex min-h-[2.667rem] w-fit items-center rounded-[0.444rem] px-[1rem] text-[0.889rem] font-semibold">
    {children}
  </span>
);

const usePreviews = () => useMessages().landing.previews;

const EmailPreview = () => {
  const t = usePreviews();

  return (
    <Panel note={t.email.note} title={t.email.title}>
      <Row>
        <span className="font-semibold">{t.email.parcelSender}</span>
        <span>{t.email.parcelSubject}</span>
        <span className="bg-negative-wash text-negative mt-[0.333rem] px-[0.667rem] py-[0.444rem] text-[0.889rem] font-semibold">
          {t.email.scamWarning}
        </span>
      </Row>
      <Row>
        <span className="font-semibold">Ana Moreno</span>
        <span>{t.email.anaSubject}</span>
      </Row>
      <Row>
        <span className="font-semibold">{t.email.draftTitle}</span>
        <span>{t.email.draftBody}</span>
        <Approve>{t.approveAndSend}</Approve>
      </Row>
    </Panel>
  );
};

const TodayPreview = () => {
  const t = usePreviews().today;

  return (
    <Panel note={t.note} title={t.title}>
      <Row>
        <Pair label={t.weather} value={t.weatherValue} />
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.waiting}
        </span>
        <span className="font-semibold">{t.pickup}</span>
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.goodNews}
        </span>
        {t.headlines.map((headline) => (
          <span key={headline}>{headline}</span>
        ))}
      </Row>
    </Panel>
  );
};

const GroceriesPreview = () => {
  const t = usePreviews().groceries;

  return (
    <Panel note={t.note} title={t.title}>
      <Row>
        {t.items.map((item) => (
          <Pair key={item.label} label={item.label} value={item.value} />
        ))}
      </Row>
      <div className="flex gap-[0.444rem]">
        <Approve>{t.copy}</Approve>
        <span className="bg-neutral-wash mt-[0.333rem] flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1rem] text-[0.889rem] font-semibold">
          {t.print}
        </span>
      </div>
    </Panel>
  );
};

const DocumentsPreview = () => {
  const t = usePreviews().documents;

  return (
    <Panel note="Google Drive" title={t.title}>
      {t.files.map((file) => (
        <Row key={file.name}>
          <Pair label={file.name} value={file.date} />
        </Row>
      ))}
      <span className="text-muted-foreground text-[0.889rem]">
        {t.footnote}
      </span>
    </Panel>
  );
};

const CirclePreview = () => {
  const t = usePreviews().circle;

  return (
    <Panel note={t.note} title={t.title}>
      <Row>
        <Pair label={t.appointments} value={t.shared} />
        <Pair label={t.rides} value={t.shared} />
        <Pair label={t.scamAlerts} value={t.notShared} />
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">{t.code}</span>
        <span className="num text-[1.222rem] font-semibold tracking-[0.06em]">
          PLUM-4821
        </span>
      </Row>
      <span className="text-accent-foreground text-[0.889rem] font-semibold underline">
        {t.stop}
      </span>
    </Panel>
  );
};

const FamilyPreview = () => {
  const t = usePreviews().family;

  return (
    <Panel note={t.note} title={t.title}>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.nextAppointment}
        </span>
        <span className="font-semibold">{t.when}</span>
      </Row>
      <Row>
        <span>{t.photos}</span>
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.replyLabel}
        </span>
        <span>{t.replyText}</span>
      </Row>
      <span className="text-muted-foreground text-[0.889rem]">
        {t.footnote}
      </span>
    </Panel>
  );
};

const RecapPreview = () => {
  const t = usePreviews().recap;

  return (
    <Panel note="Sam Rivera" title={t.title}>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.agreed}
        </span>
        <span>{t.agreedText}</span>
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.offered}
        </span>
        <span>{t.offeredText}</span>
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.nextStep}
        </span>
        <span>{t.nextStepText}</span>
        <Approve>{t.review}</Approve>
      </Row>
    </Panel>
  );
};

const HelpPreview = () => {
  const t = usePreviews().help;

  return (
    <Panel title={t.title}>
      <Row>
        <Pair label={t.answers} value={t.short} />
      </Row>
      <Row>
        <Pair label={t.oneStep} value={t.on} />
      </Row>
      <Row>
        <Pair label={t.language} value="Español" />
      </Row>
      <Row>
        <span className="text-muted-foreground text-[0.889rem]">
          {t.noteLabel}
        </span>
        <span>{t.noteText}</span>
      </Row>
    </Panel>
  );
};

const ConnectionsPreview = () => {
  const t = usePreviews().connections;

  return (
    <Panel note={t.note} title="Google Calendar">
      <Row>
        <Pair label={t.add} value={t.works} />
        <Pair label={t.see} value={t.notReady} />
      </Row>
      <span className="text-muted-foreground text-[0.889rem]">
        {t.footnote}
      </span>
    </Panel>
  );
};

const FEATURE_PREVIEWS = new Map<FeatureId, ReactNode>([
  ["circle", <CirclePreview key="circle" />],
  ["connections", <ConnectionsPreview key="connections" />],
  ["documents", <DocumentsPreview key="documents" />],
  ["email", <EmailPreview key="email" />],
  ["family", <FamilyPreview key="family" />],
  ["groceries", <GroceriesPreview key="groceries" />],
  ["help", <HelpPreview key="help" />],
  ["recap", <RecapPreview key="recap" />],
  ["today", <TodayPreview key="today" />],
]);

export { FEATURE_PREVIEWS };
