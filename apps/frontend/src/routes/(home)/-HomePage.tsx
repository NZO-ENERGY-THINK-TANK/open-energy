import homeRenewableBackground from "@/assets/backgrounds/home-renewable.png";
import InterestSection from "@/components/InterestSection";
import AdditionalDataSection from "@/routes/(home)/(sections)/-AdditionalDataSection";
import HeroSection from "@/routes/(home)/(sections)/-HeroSection";
import UsageSurveyPopup from "@/features/usage-survey/UsageSurveyPopup";

export default function HomePage() {
  return (
    <div>
      <img
        src={homeRenewableBackground}
        width={600}
        height={600}
        className="pointer-events-none absolute left-0 z-10 h-[200px] w-[300px] md:top-0 md:h-[500px] md:w-[800px]"
        alt=""
      />
      <UsageSurveyPopup />
      <div className="container mx-auto px-5 py-[52px] space-y-[52px] relative w-full overflow-hidden">
        <HeroSection />
        <AdditionalDataSection />
      </div>
      <InterestSection />
    </div>
  );
}
