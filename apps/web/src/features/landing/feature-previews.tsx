import type { ReactNode } from "react";

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

const EmailPreview = () => (
  <Panel note="3 new" title="Email">
    <Row>
      <span className="font-semibold">Parcel Delivery Service</span>
      <span>Action needed: your parcel is on hold</span>
      <span className="bg-negative-wash text-negative mt-[0.333rem] px-[0.667rem] py-[0.444rem] text-[0.889rem] font-semibold">
        This looks like a scam: it asks for payment through a link.
      </span>
    </Row>
    <Row>
      <span className="font-semibold">Ana Moreno</span>
      <span>Lunch on Sunday? Bring the photo album!</span>
    </Row>
    <Row>
      <span className="font-semibold">Reply to Ana · draft, not sent</span>
      <span>
        Sunday sounds lovely. I’ll bring the album. Is 12:30 all right? Love,
        Ruth
      </span>
      <Approve>Approve and send</Approve>
    </Row>
  </Panel>
);

const TodayPreview = () => (
  <Panel note="Monday" title="Good morning, Ruth">
    <Row>
      <Pair label="Weather" value="58°F, light rain" />
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Waiting for you
      </span>
      <span className="font-semibold">Confirm Sam’s 9:45 pickup</span>
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Good news, chosen by you
      </span>
      <span>Library extends Sunday opening hours</span>
      <span>Volunteers restore the town’s rose garden</span>
      <span>Ferry service returns for the summer</span>
    </Row>
  </Panel>
);

const GroceriesPreview = () => (
  <Panel note="$62 of $80 budget" title="Weekly shop">
    <Row>
      <Pair label="Oat milk, 2" value="$7.98" />
      <Pair label="Whole-grain bread" value="$4.49" />
      <Pair label="Apples, 6" value="$5.20" />
      <Pair label="Soup ingredients for Ana’s visit" value="$18.40" />
    </Row>
    <div className="flex gap-[0.444rem]">
      <Approve>Copy list</Approve>
      <span className="bg-neutral-wash mt-[0.333rem] flex min-h-[2.667rem] items-center rounded-[0.444rem] px-[1rem] text-[0.889rem] font-semibold">
        Print
      </span>
    </div>
  </Panel>
);

const DocumentsPreview = () => (
  <Panel note="Google Drive" title="Documents">
    <Row>
      <Pair label="Medicare summary.pdf" value="Oct 12" />
    </Row>
    <Row>
      <Pair label="Ana’s soup recipe" value="Sep 30" />
    </Row>
    <Row>
      <Pair label="Garden photos" value="Sep 14" />
    </Row>
    <span className="text-muted-foreground text-[0.889rem]">
      Choose a file to preview it. Change or share it in Google Drive.
    </span>
  </Panel>
);

const CirclePreview = () => (
  <Panel note="Until December 31" title="Shared with Sam Rivera">
    <Row>
      <Pair label="Appointments" value="Shared" />
      <Pair label="Rides" value="Shared" />
      <Pair label="Scam alerts" value="Not shared" />
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        One-time invitation code
      </span>
      <span className="num text-[1.222rem] font-semibold tracking-[0.06em]">
        PLUM-4821
      </span>
    </Row>
    <span className="text-accent-foreground text-[0.889rem] font-semibold underline">
      Stop sharing now
    </span>
  </Panel>
);

const FamilyPreview = () => (
  <Panel note="What Sam sees" title="Ruth’s updates">
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Next appointment
      </span>
      <span className="font-semibold">Dr. Patel, Tuesday at 10:30 AM</span>
    </Row>
    <Row>
      <span>2 new photos from the garden</span>
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Reply to Ruth
      </span>
      <span>See you Tuesday at 9:45!</span>
    </Row>
    <span className="text-muted-foreground text-[0.889rem]">
      Sam can read and reply. Sam can’t send, approve or spend for Ruth.
    </span>
  </Panel>
);

const RecapPreview = () => (
  <Panel note="Sam Rivera" title="Recap">
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">Agreed</span>
      <span>Sam drives you on Tuesday, picking up at 9:45.</span>
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Only offered
      </span>
      <span>Sam might bring Max along.</span>
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Suggested next step
      </span>
      <span>Remind me on Monday evening.</span>
      <Approve>Review reminder</Approve>
    </Row>
  </Panel>
);

const HelpPreview = () => (
  <Panel title="How I like help">
    <Row>
      <Pair label="Answers" value="Short" />
    </Row>
    <Row>
      <Pair label="One step at a time" value="On" />
    </Row>
    <Row>
      <Pair label="Help language" value="Español" />
    </Row>
    <Row>
      <span className="text-muted-foreground text-[0.889rem]">
        Private note
      </span>
      <span>I don’t hear well on the phone. Suggest texting first.</span>
    </Row>
  </Panel>
);

const ConnectionsPreview = () => (
  <Panel note="Connected" title="Google Calendar">
    <Row>
      <Pair label="Add an approved appointment" value="Works" />
      <Pair label="See your upcoming events" value="Not ready yet" />
    </Row>
    <span className="text-muted-foreground text-[0.889rem]">
      Each connection lists only what it can really do.
    </span>
  </Panel>
);

const FEATURE_PREVIEWS = new Map([
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
