import { ChevronDownIcon } from "lucide-react";

import { useMessages } from "@/i18n/locale";

export const HowToPlay = () => {
  const t = useMessages().solitaire;

  return (
    <details className="group border-border text-body rounded-lg border px-4 py-2 sm:px-6">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 font-semibold">
        {t.howToPlay}
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-5 shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-6 pt-4 pb-4">
        <p className="max-w-prose">{t.rules}</p>
        <p className="max-w-prose">{t.gestures}</p>
        <table className="text-label w-full text-left">
          <caption className="sr-only">{t.keyboard}</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th className="w-2/5 py-3 pr-4 font-medium" scope="col">
                {t.key}
              </th>
              <th className="py-3 font-medium" scope="col">
                {t.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {t.keys.map((row) => (
              <tr className="border-rule border-t" key={row.keys}>
                <th className="py-3 pr-4 align-top font-medium" scope="row">
                  {row.keys}
                </th>
                <td className="py-3 align-top">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
};
