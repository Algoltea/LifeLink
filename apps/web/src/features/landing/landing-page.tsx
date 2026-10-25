import "./landing.css";
import { EverydayHelp } from "./everyday-help";
import { FeatureIndex } from "./feature-index";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LanguagePicker } from "./language-picker";
import { OurPromise } from "./promise";
import { Questions } from "./questions";
import { ScamCheck } from "./scam-check";
import { SolitairePreview } from "./solitaire-preview";
import { LandingFooter, Start } from "./start";

/** The public front door for people who are not signed in. */
const LandingPage = () => (
  <div className="landing min-h-dvh">
    <Hero />
    <main>
      <HowItWorks />
      <ScamCheck />
      <EverydayHelp />
      <FeatureIndex />
      <SolitairePreview />
      <OurPromise />
      <Questions />
      <Start />
      <LanguagePicker />
    </main>
    <LandingFooter />
  </div>
);

export { LandingPage };
