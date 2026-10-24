"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  CopyIcon,
  PlusIcon,
  PrinterIcon,
  ShoppingBasketIcon,
  SquareIcon,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ModePill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

import { ListEditor, listAsText, quantityWords } from "./list-editor";
import { Authorizations, LimitForm } from "./spending";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

/** Printing shows only the list itself, in large type, without the app around it. */
const PRINT_STYLES = `@media print {
  body * { visibility: hidden !important; }
  #grocery-print, #grocery-print * { visibility: visible !important; }
  #grocery-print { position: absolute; inset: 0; display: block !important; padding: 2rem; font-size: 20pt; }
}`;

const PrintableList = ({ list }: { list: Doc<"groceryLists"> }) => (
  <div aria-hidden="true" className="hidden" id="grocery-print">
    <h2 className="pb-4 text-3xl">{list.name}</h2>
    <ul className="flex flex-col gap-3">
      {list.items
        .filter((item) => !item.checked)
        .map((item) => (
          <li key={item.id}>
            <SquareIcon aria-hidden="true" className="mr-3 inline size-5" />
            {item.name} {quantityWords(item)}
          </li>
        ))}
    </ul>
    {list.preferences.length > 0 ? (
      <p className="pt-6">Notes: {list.preferences.join("; ")}</p>
    ) : null}
  </div>
);

const NearbyStores = () => {
  const findStores = useAction(api.connections.instacartStores);

  const [result, setResult] = useState<{
    reason: string | null;
    stores: string[] | null;
  } | null>(null);

  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button
        aria-busy={busy}
        className="max-w-full self-start py-3 whitespace-normal"
        disabled={busy}
        onClick={async () => {
          setBusy(true);

          try {
            setResult(await findStores({}));
          } catch (error) {
            toast.error(errorText(error));
          }

          setBusy(false);
        }}
        variant="ghost"
      >
        Which stores are near me?
      </Button>
      {result?.reason ? (
        <p className="text-muted-foreground text-lg leading-7">
          {result.reason}
        </p>
      ) : null}
      {result?.stores ? (
        <p className="text-lg leading-7">
          {result.stores.length === 0
            ? "Instacart lists no stores for your ZIP code."
            : `On Instacart near you: ${result.stores.slice(0, 8).join(", ")}.`}
        </p>
      ) : null}
    </div>
  );
};

const ShopPanel = ({
  instacartAvailable,
  list,
  practice,
  timeZone,
}: {
  instacartAvailable: boolean;
  list: Doc<"groceryLists">;
  practice: boolean;
  timeZone: string;
}) => {
  const proposeHandoff = useMutation(api.groceries.proposeHandoff);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const hasOpenItems = list.items.some((item) => !item.checked);

  return (
    <section
      aria-labelledby="shop-heading"
      className="bg-surface flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
    >
      <h2 className="text-2xl leading-8 font-semibold" id="shop-heading">
        Ready to shop
      </h2>
      {practice ? (
        <p className="text-lg leading-7">
          Review this list, then open a practice shopping page. No store is
          contacted and nothing is bought.
        </p>
      ) : null}
      {instacartAvailable && !practice ? (
        <p className="text-lg">
          LifeLink can open this list as an Instacart shopping page after you
          review it. You’ll see real prices and pay on Instacart; LifeLink can’t
          see your order after that.
        </p>
      ) : null}
      {!instacartAvailable && !practice ? (
        <p className="text-lg">
          Instacart isn’t set up for this app, so LifeLink can’t open your list
          there. You can still print it or copy it to send.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {instacartAvailable ? (
          <Button
            aria-busy={busy}
            disabled={busy || !hasOpenItems}
            onClick={async () => {
              setBusy(true);

              try {
                const taskId = await proposeHandoff({ listId: list._id });

                // SAFETY: proposeHandoff returns a real task id, and /tasks/[taskId] is a route.
                router.push(`/tasks/${taskId}` as Route);
              } catch (error) {
                toast.error(errorText(error));
                setBusy(false);
              }
            }}
            className="max-w-full py-3 whitespace-normal"
          >
            <ShoppingBasketIcon />
            {practice
              ? "Review practice shopping"
              : "Review and shop on Instacart"}
          </Button>
        ) : null}
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={!hasOpenItems}
          onClick={() => globalThis.print()}
          variant="outline"
        >
          <PrinterIcon />
          Print the list
        </Button>
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={!hasOpenItems}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(listAsText(list));
              toast.success("List copied. You can paste it into a message.");
            } catch {
              toast.error(
                "Copying didn't work in this browser. Try printing instead."
              );
            }
          }}
          variant="outline"
        >
          <CopyIcon />
          Copy the list
        </Button>
      </div>
      {hasOpenItems ? null : (
        <p className="text-muted-foreground text-lg leading-7">
          Add an item or untick one before shopping, printing, or copying.
        </p>
      )}
      {list.lastHandoff === null ? null : (
        <p className="flex flex-wrap items-center gap-2 text-lg leading-7">
          Last opened for shopping {ago(list.lastHandoff.at, timeZone)}.{" "}
          <ModePill mode={list.lastHandoff.mode} />
          <a
            className="font-semibold underline"
            href={list.lastHandoff.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open that page again
          </a>
        </p>
      )}
      {instacartAvailable && !practice ? <NearbyStores /> : null}
    </section>
  );
};

const GroceryWorkspace = ({
  data,
  list,
  practice,
  timeZone,
}: {
  data: FunctionReturnType<typeof api.groceries.lists>;
  list: Doc<"groceryLists"> | null;
  practice: boolean;
  timeZone: string;
}) => (
  <div
    className={
      list === null
        ? "flex max-w-prose flex-col gap-8"
        : "grid items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    }
  >
    {list === null ? null : (
      <section aria-label="List" className="min-w-0">
        <ListEditor key={list._id} list={list} />
      </section>
    )}
    <div className="flex min-w-0 flex-col gap-8">
      {list === null ? null : (
        <ShopPanel
          instacartAvailable={data.instacartAvailable}
          list={list}
          practice={practice}
          timeZone={timeZone}
        />
      )}
      <section
        aria-label="Spending"
        className="border-rule flex scroll-mt-24 flex-col gap-8 border-t pt-6"
        id="spending"
      >
        <LimitForm key={data.limit?._id ?? "none"} limit={data.limit} />
        <Authorizations
          authorizations={data.authorizations.filter(
            (authorization) => authorization.listId === list?._id
          )}
          list={data.instacartAvailable ? list : null}
          timeZone={timeZone}
        />
      </section>
    </div>
    {list === null ? null : <PrintableList list={list} />}
  </div>
);

const GroceriesScreen = () => {
  const data = useQuery(api.groceries.lists);
  const createList = useMutation(api.groceries.createList);
  const { me } = usePreferences();
  const [chosen, setChosen] = useState<Id<"groceryLists"> | null>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  const list =
    data?.lists.find((candidate) => candidate._id === chosen) ??
    data?.lists[0] ??
    null;

  const newList = async (): Promise<void> => {
    try {
      setChosen(
        await createList({
          name: data?.lists.length
            ? `List ${data.lists.length + 1}`
            : "Groceries",
        })
      );
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <PageHeader
        actions={
          <Button onClick={newList} variant="outline">
            <PlusIcon />
            New list
          </Button>
        }
        subline="Keep a list and an estimated budget. Review it before opening a shopping page."
        title="Groceries"
      />
      {data === undefined ? (
        <LoadingRows label="Loading your lists" rows={4} />
      ) : null}
      {data !== undefined && list === null ? (
        <EmptyNote
          action={
            <Button onClick={newList}>
              <PlusIcon />
              Start a list
            </Button>
          }
        >
          No grocery lists yet.
        </EmptyNote>
      ) : null}
      {data !== undefined && data.lists.length > 1 ? (
        <nav aria-label="Your lists" className="flex flex-wrap gap-2">
          {data.lists.map((candidate) => (
            <Button
              aria-current={candidate._id === list?._id ? "true" : undefined}
              key={candidate._id}
              onClick={() => setChosen(candidate._id)}
              variant={candidate._id === list?._id ? "secondary" : "outline"}
            >
              {candidate.name}
            </Button>
          ))}
        </nav>
      ) : null}
      {data === undefined ? null : (
        <GroceryWorkspace
          data={data}
          list={list}
          practice={Boolean(me?.profile?.demoMode)}
          timeZone={timeZone}
        />
      )}
    </>
  );
};

export { GroceriesScreen };
