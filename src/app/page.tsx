import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/home/HeroSection";
import CTASection from "@/components/home/CTASection";
import HomeClient from "@/components/home/HomeClient";
import LiveParticipation from "@/components/home/LiveParticipation";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HomeClient />
        <LiveParticipation />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
