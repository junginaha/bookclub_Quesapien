import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/home/HeroSection";
import BooksSection from "@/components/home/BooksSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import SeasonsSection from "@/components/home/SeasonsSection";
import LeadersSection from "@/components/home/LeadersSection";
import TodaySection from "@/components/home/TodaySection";
import AskSection from "@/components/home/AskSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <BooksSection />
        <TestimonialsSection />
        <SeasonsSection />
        <LeadersSection />
        <TodaySection />
        <AskSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
