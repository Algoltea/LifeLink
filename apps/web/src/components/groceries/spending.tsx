"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { useMutation } from "convex/react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { EmptyNote } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatDay, money } from "@/lib/format";

import { centsFromDollars, dollarsFromCents } from "./amounts";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const DEFAULT_PER_ORDER = "80.00";
const DEFAULT_DAYS = "28";
const DEFAULT_USES = "4";

/** The person's own grocery limits. Only this form can change them; nothing the assistant reads can. */
const LimitForm = ({ limit }: { limit: Doc<"spendingLimits"> | null }) => {
  const setLimit = useMutation(api.groceries.setLimit);

  const [perOrder, setPerOrder] = useState(
    limit === null ? DEFAULT_PER_ORDER : dollarsFromCents(limit.perOrderCents)
  );

  const [monthly, setMonthly] = useState(
    dollarsFromCents(limit?.monthlyCents ?? null)
  );

  const baseId = useId();
  const perOrderCents = centsFromDollars(perOrder);

  const monthlyInvalid =
    monthly.trim().length > 0 && centsFromDollars(monthly) === null;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();

        if (perOrderCents === null) {
          return;
        }

        try {
          await setLimit({
            monthlyCents: centsFromDollars(monthly),
            perOrderCents,
          });
          toast.success("Spending limit saved.");
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <h2 className="text-2xl leading-8 font-semibold">Spending limit</h2>
      <p className="text-muted-foreground text-lg leading-7">
        {limit === null
          ? "No limit is set yet."
          : `Now: ${money(limit.perOrderCents)} per order${limit.monthlyCents === null ? "" : `, ${money(limit.monthlyCents)} a month`}.`}{" "}
        LifeLink won’t prepare a shop above this without asking you to change it
        here first.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-order`}>Most per order ($)</Label>
          <Input
            aria-describedby={
              perOrderCents === null ? `${baseId}-order-error` : undefined
            }
            aria-invalid={perOrderCents === null}
            id={`${baseId}-order`}
            inputMode="decimal"
            onChange={(event) => setPerOrder(event.target.value)}
            value={perOrder}
          />
          {perOrderCents === null ? (
            <p
              className="text-negative text-lg leading-7"
              id={`${baseId}-order-error`}
              role="alert"
            >
              Enter a spending limit such as 80.00.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-month`}>Most per month ($)</Label>
          <Input
            aria-describedby={
              monthlyInvalid ? `${baseId}-month-error` : undefined
            }
            aria-invalid={monthlyInvalid}
            id={`${baseId}-month`}
            inputMode="decimal"
            onChange={(event) => setMonthly(event.target.value)}
            placeholder="No monthly limit"
            value={monthly}
          />
          {monthlyInvalid ? (
            <p
              className="text-negative text-lg leading-7"
              id={`${baseId}-month-error`}
              role="alert"
            >
              Enter an amount such as 400.00, or leave it blank for no monthly
              limit.
            </p>
          ) : null}
        </div>
      </div>
      <Button
        className="self-start"
        disabled={perOrderCents === null || monthlyInvalid}
        type="submit"
        variant="outline"
      >
        Save limit
      </Button>
    </form>
  );
};

const AuthorizationForm = ({
  list,
  onDone,
}: {
  list: Doc<"groceryLists">;
  onDone: () => void;
}) => {
  const createAuthorization = useMutation(api.groceries.createAuthorization);

  const [maxPerUse, setMaxPerUse] = useState(
    dollarsFromCents(list.budgetCents) || DEFAULT_PER_ORDER
  );

  const [uses, setUses] = useState(DEFAULT_USES);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const baseId = useId();
  const maxPerUseCents = centsFromDollars(maxPerUse);

  return (
    <form
      className="border-border bg-raised flex flex-col gap-4 rounded-xl border px-5 py-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (maxPerUseCents === null) {
          return;
        }

        try {
          await createAuthorization({
            days: Number(days),
            listId: list._id,
            maxPerUseCents,
            maxUses: Number(uses),
          });
          toast.success("Standing permission saved.");
          onDone();
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <p className="text-lg">
        Each week, LifeLink may open “{list.name}” as a shopping page without
        asking, as long as your guesses stay under the amount below. Anything
        over it waits for you. In live mode, you choose the store and pay on
        Instacart. Practice mode opens a sample page instead.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-amount`}>Up to ($) each time</Label>
          <Input
            aria-invalid={maxPerUseCents === null}
            id={`${baseId}-amount`}
            inputMode="decimal"
            onChange={(event) => setMaxPerUse(event.target.value)}
            value={maxPerUse}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-uses`}>How many times (1 to 12)</Label>
          <Input
            id={`${baseId}-uses`}
            max={12}
            min={1}
            onChange={(event) => setUses(event.target.value)}
            type="number"
            value={uses}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-days`}>For how many days (1 to 90)</Label>
          <Input
            id={`${baseId}-days`}
            max={90}
            min={1}
            onChange={(event) => setDays(event.target.value)}
            type="number"
            value={days}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          className="max-w-full py-3 whitespace-normal"
          disabled={maxPerUseCents === null}
          type="submit"
        >
          Allow weekly shopping pages
        </Button>
        <Button onClick={onDone} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
};

const Authorizations = ({
  authorizations,
  list,
  timeZone,
}: {
  authorizations: Doc<"recurringAuthorizations">[];
  list: Doc<"groceryLists"> | null;
  timeZone: string;
}) => {
  const revoke = useMutation(api.groceries.revokeAuthorization);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl leading-8 font-semibold">Standing permission</h2>
      {authorizations.length === 0 ? (
        <EmptyNote>
          Nothing runs by itself. Every shop waits for your approval.
        </EmptyNote>
      ) : (
        <ul>
          {authorizations.map((authorization) => (
            <li
              className="border-rule flex flex-wrap items-center justify-between gap-3 border-t py-4"
              key={authorization._id}
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">
                  Weekly, up to {money(authorization.maxPerUseCents)} each time
                </span>
                <span className="text-muted-foreground text-base">
                  Used {authorization.usesCount} of {authorization.maxUses}{" "}
                  times · ends {formatDay(authorization.expiresAt, timeZone)}
                </span>
              </div>
              <Button
                onClick={async () => {
                  try {
                    await revoke({ authorizationId: authorization._id });
                    toast.success("Standing permission ended.");
                  } catch (error) {
                    toast.error(errorText(error));
                  }
                }}
                size="sm"
                variant="destructive"
              >
                End it now
              </Button>
            </li>
          ))}
        </ul>
      )}
      {adding && list !== null ? (
        <AuthorizationForm list={list} onDone={() => setAdding(false)} />
      ) : null}
      {adding || list === null ? null : (
        <Button
          className="max-w-full self-start whitespace-normal"
          onClick={() => setAdding(true)}
          variant="outline"
        >
          Allow weekly shopping pages
        </Button>
      )}
    </div>
  );
};

export { Authorizations, LimitForm };
