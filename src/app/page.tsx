import ClarkFeatures from "@/components/new-landing-page/clark-feats";
import ClarkStory from "@/components/new-landing-page/clark-story";
import ClarkChat from "@/components/new-landing-page/ClarkChat";
import Hero from "@/components/new-landing-page/hero";
import Navbar from "@/components/new-landing-page/navbar";
import ShareVibe from "@/components/new-landing-page/share-vibe";
import SignIt from "@/components/new-landing-page/sign-it";

export default function Home() {
  return (
    <div className="satoshi bg-[#262626]">
      {/* <main className="bg-[#F8F8F8]">
        <Hero />
        <WhyClark />
        <AboutClark />
        <Collab />
      </main>
      <Footer /> */}
      <div id="smooth-wrapper">
        <div id="smooth-content" className="bg-[#262626]">
          <Navbar />
          <Hero />
          <ClarkStory />
          <ClarkFeatures />
          <ClarkChat />
          <ShareVibe />
          <SignIt />
        </div>
      </div>
    </div>
  );
}
