import ClarkStory from "@/components/new-landing-page/clark-story";
import Hero from "@/components/new-landing-page/hero";
import Navbar from "@/components/new-landing-page/navbar";


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
      <Navbar />
      <Hero />
      <ClarkStory />
    </div>
  );
}
