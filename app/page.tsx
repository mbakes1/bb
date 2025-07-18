import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import Integrations from "@/components/homepage/integrations";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <Integrations />
      <FooterSection />
    </>
  );
}
