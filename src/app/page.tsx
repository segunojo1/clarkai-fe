import AboutClark from "@/components/landing/about-clark";
import Collab from "@/components/landing/collab";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import WhyClark from "@/components/landing/why-clark";

export default function Home() {
  return (
    <div className="satoshi">
      <main className="bg-[#F8F8F8]">
        <Hero />
        <WhyClark />
        <AboutClark />
        <Collab />
      </main>
      <Footer />
    </div>
  );
}
