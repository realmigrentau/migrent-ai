import SEOHead from "../components/SEOHead";
import MigrentHero from "../components/home/MigrentHero";
import LifestyleIntro from "../components/home/LifestyleIntro";
import SearchConsole from "../components/home/SearchConsole";
import TrustStrip from "../components/home/TrustStrip";
import WhyItMatters from "../components/home/WhyItMatters";
import HowItWorks from "../components/home/HowItWorks";
import BeliefStatement from "../components/home/BeliefStatement";
import VerifiedPanel from "../components/home/VerifiedPanel";
import Offerings from "../components/home/Offerings";
import BrowseRooms from "../components/home/BrowseRooms";
import Neighbourhoods from "../components/home/Neighbourhoods";
import SupportBand from "../components/home/SupportBand";
import GuidesAndFaq from "../components/home/GuidesAndFaq";
import ClosingCta from "../components/home/ClosingCta";

/**
 * The homepage.
 *
 * One argument, in order: what this is (hero, intro, search) → why it
 * matters (the ledger) → how it works (the four steps) → what we believe
 * → why you can trust it (verification) → what you get → what is actually
 * available → where → who helps you → what to read → the close.
 *
 * The visual system is styles/home.css, which takes its palette, type,
 * radii and motion from the cinematic hero and is scoped to [data-home]
 * (set in components/Layout.tsx). Sections live in components/home so
 * this file stays the running order and nothing else.
 */
export default function Home() {
  return (
    <>
      <SEOHead
        title="A real home in Australia, found the right way"
        description="Rooms across Australia for migrants, students and new arrivals. Hosts are ID-checked before a room goes live. Renters pay MigRent nothing."
      />

      {/* 1 · the photograph */}
      <MigrentHero />
      {/* 2 · the editorial line the hero's fog runs into */}
      <LifestyleIntro />
      {/* 3 · the thing to do */}
      <SearchConsole />
      <TrustStrip />

      {/* 4 · why it matters */}
      <WhyItMatters />
      {/* 5 · how it works */}
      <HowItWorks />
      {/* 6 · the belief, on the sky at night */}
      <BeliefStatement />
      {/* 7 · why you can trust it */}
      <VerifiedPanel />

      {/* 8 · what you get, and what is available now */}
      <Offerings />
      <BrowseRooms />
      <Neighbourhoods />

      {/* 9 · who helps, and who it is for */}
      <SupportBand />
      {/* 10 · reading, and answers */}
      <GuidesAndFaq />
      {/* 11 · the close, back on the same sky */}
      <ClosingCta />
    </>
  );
}
