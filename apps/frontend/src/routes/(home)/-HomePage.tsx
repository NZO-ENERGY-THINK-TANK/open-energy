import InterestSection from "@/routes/(home)/(sections)/-InterestSection";
import AdditionalDataSection from "@/routes/(home)/(sections)/-AdditionalDataSection";
import HeroSection from "@/routes/(home)/(sections)/-HeroSection";

export default function HomePage() {
  return (
    <div>
      <img
        src="/legacy/images/Ellipse 89.png"
        width={600}
        height={600}
        className="pointer-events-none absolute left-0 z-10 h-[200px] w-[300px] md:top-0 md:h-[500px] md:w-[800px]"
        alt=""
      />
      {/* TODO: Migrate NewsletterPopup and render it here. */}
      <div className="container mx-auto px-5 py-[52px] space-y-[52px] relative w-full overflow-hidden">
        <HeroSection />
        <AdditionalDataSection />
      </div>
      <InterestSection />
    </div>
  );
}
