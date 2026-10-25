"use client";

import { intlLocaleOf } from "@lifelink/contracts/locale";
import { Input } from "@lifelink/ui/components/input";
import { useMemo } from "react";

import { useLocale, useMessages } from "@/i18n/locale";

/** Calling codes by region. Several regions share +1, so the region is what gets picked. */
const CALLING_CODES = {
  AE: "971",
  AF: "93",
  AL: "355",
  AM: "374",
  AR: "54",
  AT: "43",
  AU: "61",
  AZ: "994",
  BA: "387",
  BD: "880",
  BE: "32",
  BG: "359",
  BH: "973",
  BO: "591",
  BR: "55",
  CA: "1",
  CH: "41",
  CI: "225",
  CL: "56",
  CM: "237",
  CN: "86",
  CO: "57",
  CR: "506",
  CU: "53",
  CY: "357",
  CZ: "420",
  DE: "49",
  DK: "45",
  DO: "1",
  DZ: "213",
  EC: "593",
  EE: "372",
  EG: "20",
  ES: "34",
  ET: "251",
  FI: "358",
  FJ: "679",
  FR: "33",
  GB: "44",
  GE: "995",
  GH: "233",
  GR: "30",
  GT: "502",
  HK: "852",
  HN: "504",
  HR: "385",
  HT: "509",
  HU: "36",
  ID: "62",
  IE: "353",
  IL: "972",
  IN: "91",
  IQ: "964",
  IR: "98",
  IS: "354",
  IT: "39",
  JM: "1",
  JO: "962",
  JP: "81",
  KE: "254",
  KH: "855",
  KR: "82",
  KW: "965",
  KZ: "7",
  LA: "856",
  LB: "961",
  LK: "94",
  LT: "370",
  LU: "352",
  LV: "371",
  LY: "218",
  MA: "212",
  MK: "389",
  MM: "95",
  MN: "976",
  MT: "356",
  MX: "52",
  MY: "60",
  NG: "234",
  NI: "505",
  NL: "31",
  NO: "47",
  NP: "977",
  NZ: "64",
  OM: "968",
  PA: "507",
  PE: "51",
  PH: "63",
  PK: "92",
  PL: "48",
  PR: "1",
  PT: "351",
  PY: "595",
  QA: "974",
  RO: "40",
  RS: "381",
  RU: "7",
  RW: "250",
  SA: "966",
  SD: "249",
  SE: "46",
  SG: "65",
  SI: "386",
  SK: "421",
  SN: "221",
  SV: "503",
  TH: "66",
  TN: "216",
  TR: "90",
  TW: "886",
  TZ: "255",
  UA: "380",
  UG: "256",
  US: "1",
  UY: "598",
  UZ: "998",
  VE: "58",
  VN: "84",
  YE: "967",
  ZA: "27",
  ZM: "260",
  ZW: "263",
} as const satisfies Record<string, string>;

const callingCodes = new Map<string, string>(Object.entries(CALLING_CODES));

/** For codes several regions share, the one to assume when the device doesn't say otherwise. */
const MAIN_REGION_FOR_CODE = new Map([
  ["1", "US"],
  ["7", "RU"],
]);

/** Shown first; the rest follow alphabetically. */
const COMMON_REGIONS = ["US", "CA", "MX", "GB", "IN", "PH"] as const;

/** Chosen when the person would rather type the whole number, + code included. */
const OTHER_REGION = "";

const NON_DIGITS = /\D/gu;
const SPLIT_PATTERN = /^\+(?<digits>\d+)$/u;

const commonRegions = new Set<string>(COMMON_REGIONS);

/** The device's region when it has a calling code, else the United States. */
const defaultRegion = (): string => {
  const language = globalThis.navigator?.language ?? "en-US";
  const region = new Intl.Locale(language).maximize().region ?? "";

  return callingCodes.has(region) ? region : "US";
};

interface SplitPhone {
  number: string;
  region: string;
}

/** "+15555550142" → { region: "US", number: "5555550142" }, preferring the device's region for shared codes. */
const splitPhone = (address: string, preferredRegion: string): SplitPhone => {
  const digits = SPLIT_PATTERN.exec(address.replaceAll(/[\s().-]/gu, ""))
    ?.groups?.digits;

  if (digits === undefined) {
    return {
      number: address,
      region: address ? OTHER_REGION : preferredRegion,
    };
  }

  const matches = [...callingCodes.entries()]
    .filter(([, code]) => digits.startsWith(code))
    .toSorted(
      ([regionA, codeA], [regionB, codeB]) =>
        codeB.length - codeA.length ||
        Number(regionB === preferredRegion) -
          Number(regionA === preferredRegion) ||
        Number(MAIN_REGION_FOR_CODE.get(codeB) === regionB) -
          Number(MAIN_REGION_FOR_CODE.get(codeA) === regionA)
    );

  const [match] = matches;

  if (match === undefined) {
    return { number: address, region: OTHER_REGION };
  }

  const [region, code] = match;

  return { number: digits.slice(code.length), region };
};

/** The full international number to save, or "" when nothing was typed. */
const joinPhone = (region: string, number: string): string => {
  const trimmed = number.trim();

  if (trimmed.length === 0) {
    return "";
  }

  if (region === OTHER_REGION || trimmed.startsWith("+")) {
    return trimmed;
  }

  const digits = trimmed.replaceAll(NON_DIGITS, "");

  // Most countries drop the leading 0 people dial at home (UK 07946… → +44 7946…); Italy keeps it.
  const national =
    region !== "IT" && digits.startsWith("0") ? digits.slice(1) : digits;

  return `+${callingCodes.get(region) ?? ""}${national}`;
};

/** A country-code dropdown beside the number, so nobody has to remember "+1". */
const PhoneNumberField = ({
  describedBy,
  id,
  number,
  onChange,
  region,
}: {
  describedBy?: string;
  id: string;
  number: string;
  onChange: (next: { number: string; region: string }) => void;
  region: string;
}) => {
  const locale = useLocale();
  const { phone: words } = useMessages().appExtras;

  const { common, other } = useMemo(() => {
    const intlLocale = intlLocaleOf(locale);
    const regionNames = new Intl.DisplayNames([intlLocale], { type: "region" });

    const toOption = (regionCode: string) => ({
      label: `${regionNames.of(regionCode) ?? regionCode} +${callingCodes.get(regionCode) ?? ""}`,
      value: regionCode,
    });

    return {
      common: COMMON_REGIONS.map(toOption),
      other: [...callingCodes.keys()]
        .flatMap((regionCode) =>
          commonRegions.has(regionCode) ? [] : [toOption(regionCode)]
        )
        .toSorted((first, second) =>
          first.label.localeCompare(second.label, intlLocale)
        ),
    };
  }, [locale]);

  return (
    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
      <select
        aria-label={words.countryCode}
        className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border px-4 py-2 text-base transition-colors sm:w-56"
        onChange={(event) => onChange({ number, region: event.target.value })}
        value={region}
      >
        <optgroup label={words.common}>
          {common.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
        <optgroup label={words.allCountries}>
          {other.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value={OTHER_REGION}>{words.other}</option>
        </optgroup>
      </select>
      <Input
        aria-describedby={describedBy}
        autoComplete="tel-national"
        className="min-w-0 flex-1 basis-48"
        id={id}
        inputMode="tel"
        onChange={(event) => onChange({ number: event.target.value, region })}
        placeholder={region === OTHER_REGION ? "+44 20 7946 0958" : undefined}
        type="tel"
        value={number}
      />
    </div>
  );
};

export { PhoneNumberField, defaultRegion, joinPhone, splitPhone };
