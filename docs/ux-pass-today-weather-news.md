# UX pass: Today, weather, news, Connections, Scam check, voice — 24 October 2026

A short pass on pointers, motion, Connections wording, and a calmer Today page with weather, email, and news. Each change was committed on its own on `feat/ux-pass`, and an independent reviewer (Codex, `gpt-6.1-sol`, high effort) checked every commit. Accepted findings were fixed in follow-up commits.

## Changes

- **Pointers:** one base rule in `packages/ui` gives a pointer to every enabled button, select, summary, and ARIA control, and none to controls Base UI marks as disabled. Labels that toggle a checkbox or switch, and the account menu items, also show a pointer.
- **Motion:** three utilities: `motion-pop` (Base UI popups fade and scale from 0.97), `motion-fade` (backdrops and the mobile menu), and `motion-enter` (content that arrives after loading rises 0.25rem over 200ms). Buttons press to 0.98. The existing reduced-motion rules cut all of it. Dialogs keep their content while they fade out.
- **Connections:** cards say what opening them leads to (Connect, Manage, Set up, Details). Each capability icon has a short visible word under it (Read, Draft, Send, Find dates, …) instead of a tooltip, because touch has no hover and a tooltip inside a button cannot take focus. Every window uses one order: Can do, What you need, then two closed sections, "What LifeLink can't do yet" and "Setting this up for someone?". The helper section holds the sign-in steps (only when Connect shows), the iMessage steps, the Discord user ID note, or one `bun run dev:setup` line when a service is not turned on. Window text is body size and in the normal text color; gray is only for short tags.
- **Today:**
  - Order on every width: Getting started, Needs you (only when tasks wait), Your week and Messages (side by side when the content area is 56rem or wider), News, then Ask. The groups are flat, without panels; row text lines up with the headings and the hover wash reaches past it.
  - The date line shows the current weather as plain text ("Saturday, October 24 · 59° Cloudy · H 60° L 32°"). It opens a popover with the week and the Open-Meteo credit.
  - With no postal code, Your week starts with "See the weather for your appointments · Add your postal code". A place that was not found asks to check the code. Real accounts also get "Add your postal code" as a fourth Getting started step.
  - Appointments in Your week show that day's weather; the words get louder only when the weather should change plans (rain, snow, storms, ice, heat).
  - Messages holds From family and friends and Latest email, each with an "All …" link. A flagged email shows "Likely a scam" (red) or "Warning signs" (amber), the same words as the Scam check page.
  - News switches between Good news (Good News Network and Smithsonian Smart News, horoscopes skipped) and Top news (NPR). The choice is saved to the profile; Settings can hide news. The list keeps a three-row height so switching does not scroll the page.
  - Read my day aloud adds one weather sentence, who wrote in the last two days, and, only when a shown email is flagged, "One email is likely a scam. Proceed with caution." It does not read headlines, message text, or subjects.
- **Assistant:** read-only `get_weather` and `get_news` tools use the same cached functions as Today. They change nothing and prepare nothing for review. Headline text is treated as untrusted input.
- **Settings and onboarding:** "ZIP code" is now "Postal code" with a normal keyboard. Onboarding asks for an optional postal code and shows the town it found, which is then saved as the city. Settings shows only the postal code; the saved town stays while the code is the same (ignoring case and spaces) and is cleared when it changes.
- **Scam check:** after merging main, Scam check v2 takes priority over this branch's earlier layout. The unboxed message form, camera controls, results, Earlier checks, trusted-person actions, and call screening come from main. The follow-up uses compact Text, Photo, and Email source controls, 18px body text, 16px labels/help text, and standard button sizes to match Email and Trusted circle. The photo drop heading is body size rather than section size. The inline photo-retention note and duplicate "Type the words instead" button are removed; retention stays under How checks work and in results/deletion, and Text stays in the source selector. Manual text/email/photo checks use AI by default, with no per-check checkbox; one line says an AI service reads the message and to leave out passwords and card numbers. Practice never uses AI; text/email retain local-rule fallback. Live call screening keeps its separate consent checkbox. Automatic checks on incoming email stay local.
- **Trusted circle and loading:** the sample-people note is one small gray line. The loading shell no longer draws the Practice mode banner, which only practice accounts have.
- **Voice (Speak in Ask LifeLink):** the microphone and audio contexts start straight from the Speak press, before any network call. Before, Safari kept audio paused when it started after the token and connection calls. Capture uses the device's own sample rate (Firefox refuses a forced 16 kHz). Stop gives the microphone back at every stage, including during the permission prompt. Events from an earlier attempt cannot end a newer one. Microphone and dictation problems are explained in plain words instead of the button silently turning back to Speak.

## Weather and news data

- **Weather:** Open-Meteo, no key. The saved postal code is tried whole, then its first part (UK outward codes), then the city; a result in the saved time zone wins. Open-Meteo is free for non-commercial use and asks for visible credit.
- **News:** public RSS feeds, headlines and links only, with the source named on each row. Check each publisher's terms before a commercial launch.
- **Caching and limits:** one shared copy per saved place and per news kind, refreshed at most every 30 minutes. After a failure the same place or feed waits five minutes, and each person can start at most ten outside fetches a minute. A failed refresh keeps the last good copy.

## Later work

- **Unread state for messages and email.** Today and read aloud cannot tell what the person has already seen. Plan: a per-contact "last opened" time for messages; for email, "opened in LifeLink" plus Outlook's `isRead` and Gmail's `UNREAD` label (check first that Composio returns labels). Count only unread items from the last two days.
- **AI by default elsewhere.** Recap, Explain, and the email summary still ask for cloud AI each time.

## Review findings not taken

- **Cache presence by postal code:** someone who saves another person's postal code can tell whether anyone with that code opened Today recently. The signal is postal-code wide and the forecast is public, so it was accepted.
- **Rejecting all results outside the saved time zone:** this would turn a slightly wrong time zone into "not found". The popover names the place, so a wrong match is visible and can be fixed in Settings.
- **Practice cue in read aloud:** the whole account is in Practice mode and the banner says so; the screen text has no such cue either.
- **A separate "Find files" label for Drive:** labels follow the icon kind, so this needs a new kind; "Read" stays for now.
- **"When available" in the Scam check line:** only a developer setup lacks the AI key.
- **Streaming size limits on feeds:** the feed URLs are fixed, known publishers with a 10-second timeout; size is checked after download and each item and field is capped.

## Verification

- **Merge from main:** `bun run check`, `bun run check-types`, and `bun run test` pass on the combined branch (552 tests). Main's passive call transport and this branch's Speak implementation are both preserved. No browser checks or production build were run for this merge; the owner will check the screens.
- `bun run check`, `bun run check-types`, and `bun run test` pass on every commit; weather and news have 20 backend tests (feed parsing, place search, caching, fetch limits, the setup lookup, and news preferences).
- Live checks against the real services: postal codes 10001 (New York) and LS1 4AP (Farnley, England, a part of Leeds) and the city "Springfield" (Massachusetts for an `America/New_York` profile) resolve; all three feeds parse; the Gemini Live token and session open and accept 48 kHz audio.
- **Browser:** the owner checked Today, Connections, Settings, Scam check, and Trusted circle in Safari on a Mac during the pass; no automated browser run was made.
- **Not verified:** a real microphone in Safari, Chrome, or Firefox, and the assistant's tool use with the live model.
