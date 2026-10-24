/**
 * Instacart Developer Platform: turn a list into an Instacart-hosted shopping
 * page. The API cannot check out, show prices, or report order status; the
 * person picks a store and pays on Instacart.
 */
import { z } from "zod";

import { readEnv, readEnvOr } from "../lib/env";
import { decodeJson, describeRejection, request } from "./http";

const baseUrl = (): string =>
  readEnvOr("INSTACART_ENVIRONMENT", "development") === "production"
    ? "https://connect.instacart.com"
    : "https://connect.dev.instacart.tools";

const instacartKey = (): string | null => readEnv("INSTACART_API_KEY");

interface ListItem {
  name: string;
  quantity: number | null;
  unit: string | null;
}

type InstacartResult =
  | { error: string; kind: "rejected" }
  | { error: string; kind: "uncertain" }
  | { kind: "ok"; url: string };

const linkSchema = z.object({ products_link_url: z.string() }).loose();

const createShoppingListPage = async (
  apiKey: string,
  title: string,
  items: ListItem[],
  linkbackUrl: string,
  preferences: string[]
): Promise<InstacartResult> => {
  const instructions =
    preferences.length > 0 ? [`Preferences: ${preferences.join(", ")}.`] : [];

  const outcome = await request({
    body: JSON.stringify({
      expires_in: 30,
      instructions,
      landing_page_configuration: { partner_linkback_url: linkbackUrl },
      line_items: items.map((item) => ({
        display_text:
          item.quantity === null
            ? item.name
            : `${item.name}, ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`,
        line_item_measurements:
          item.quantity === null
            ? []
            : [{ quantity: item.quantity, unit: item.unit ?? "each" }],
        name: item.name,
      })),
      link_type: "shopping_list",
      title,
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${baseUrl()}/idp/v1/products/products_link`,
  });

  if (outcome.kind === "uncertain") {
    return { error: outcome.reason, kind: "uncertain" };
  }

  if (outcome.kind === "rejected") {
    return {
      error: describeRejection(outcome.status, outcome.body),
      kind: "rejected",
    };
  }

  const parsed = decodeJson(linkSchema, outcome.body);

  return parsed === null
    ? { error: "Instacart's answer could not be read.", kind: "uncertain" }
    : { kind: "ok", url: parsed.products_link_url };
};

const retailersSchema = z
  .object({
    retailers: z.array(
      z.object({ name: z.string(), retailer_key: z.string() }).loose()
    ),
  })
  .loose();

const nearbyRetailers = async (
  apiKey: string,
  postalCode: string
): Promise<string[] | null> => {
  const outcome = await request({
    headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
    method: "GET",
    url: `${baseUrl()}/idp/v1/retailers?postal_code=${encodeURIComponent(postalCode)}&country_code=US`,
  });

  if (outcome.kind !== "ok") {
    return null;
  }

  return (
    decodeJson(retailersSchema, outcome.body)?.retailers.map(
      (retailer) => retailer.name
    ) ?? null
  );
};

export { createShoppingListPage, instacartKey, nearbyRetailers };

export type { InstacartResult, ListItem };
