# UX pass: Today, weather, news, Connections, voice — 24 October 2026

A short pass on pointers, motion, Connections wording, and a calmer Today page with weather, email, and news. Each change was committed on its own on `feat/ux-pass`, and an independent reviewer (Codex, `gpt-6.1-sol`, high effort) checked every commit. Accepted findings were fixed in follow-up commits.

## Changes

- **Pointers:** one base rule in `packages/ui` gives a pointer to every enabled button, select, summary, and ARIA control, and none to controls Base UI marks as disabled. Labels that toggle a checkbox or switch, and the account menu items, also show a pointer.
- **Motion:** three utilities: `motion-pop` (Base UI popups fade and scale from 0.97), `motion-fade` (backdrops and the mobile menu), and `motion-enter` (content that arrives after loading rises 0.25rem over 200ms). Buttons press to 0.98. The existing reduced-motion rules cut all of it. Dialogs keep their content while they fade out.
- **Connections:** cards say what opening them leads to (Connect, Manage, Set up, Details), and count only what works. The service window leads with "Can do"; limits sit in one closed disclosure, tagged "Coming later" or "Not possible". Services with nothing available are short "Coming later" rows. Catalog notes that only repeated "not available yet" are gone.
- **Today:**
  - The header shows the current weather. A popover holds the week and credits Open-Meteo.
  - Appointments in This week show that day's weather; the words get louder only when the weather should change plans (rain, snow, storms, ice, heat).
  - Latest email lists the three newest messages, with a "Check first" tag when a scam check flagged one. LifeLink does not store read state, so there is no unread marker.
  - News switches between Good news (Good News Network and Smithsonian Smart News, horoscopes skipped) and Top news (NPR). The choice is saved to the profile; Settings can hide news.
  - With nothing to review, that section steps aside; the header line already says so.
  - Read my day aloud ends with one weather sentence. It does not read headlines.
- **Assistant:** read-only `get_weather` and `get_news` tools use the same cached functions as Today. They change nothing and prepare nothing for review. Headline text is treated as untrusted input.
- **Settings and onboarding:** "ZIP code" is now "Postal code" with a normal keyboard. Onboarding asks for an optional postal code and shows the town it found, which is then saved as the city.
- **Voice (Speak in Ask LifeLink):** the microphone and audio contexts start straight from the Speak press, before any network call. Before, Safari kept audio paused when it started after the token and connection calls. Capture uses the device's own sample rate (Firefox refuses a forced 16 kHz). Stop gives the microphone back at every stage, including during the permission prompt. Events from an earlier attempt cannot end a newer one. Microphone and dictation problems are explained in plain words instead of the button silently turning back to Speak.

## Weather and news data

- **Weather:** Open-Meteo, no key. The saved postal code is tried whole, then its first part (UK outward codes), then the city; a result in the saved time zone wins. Open-Meteo is free for non-commercial use and asks for visible credit.
- **News:** public RSS feeds, headlines and links only, with the source named on each row. Check each publisher's terms before a commercial launch.
- **Caching and limits:** one shared copy per saved place and per news kind, refreshed at most every 30 minutes. After a failure the same place or feed waits five minutes, and each person can start at most ten outside fetches a minute. A failed refresh keeps the last good copy.

## Review findings not taken

- **Cache presence by postal code:** someone who saves another person's postal code can tell whether anyone with that code opened Today recently. The signal is postal-code wide and the forecast is public, so it was accepted.
- **Rejecting all results outside the saved time zone:** this would turn a slightly wrong time zone into "not found". The popover names the place, so a wrong match is visible and can be fixed in Settings.
- **Streaming size limits on feeds:** the feed URLs are fixed, known publishers with a 10-second timeout; size is checked after download and each item and field is capped.

## Verification

- `bun run check`, `bun run check-types`, and `bun run test` pass on every commit; weather and news have 20 backend tests (feed parsing, place search, caching, fetch limits, the setup lookup, and news preferences).
- Live checks against the real services: postal codes 10001 (New York) and LS1 4AP (Farnley, England, a part of Leeds) and the city "Springfield" (Massachusetts for an `America/New_York` profile) resolve; all three feeds parse; the Gemini Live token and session open and accept 48 kHz audio.
- **Not verified:** the pages in a browser (no headless browser or test login was available), a real microphone in Safari, Chrome, or Firefox, and the assistant's tool use with the live model.
