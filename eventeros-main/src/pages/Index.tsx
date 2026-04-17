import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LiveEventsSection } from "@/components/landing/LiveEventsSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { OrganisationsSection } from "@/components/landing/OrganisationsSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <HeroSection />
      <OrganisationsSection 
        selectedOrgId={selectedOrgId} 
        onOrgSelect={setSelectedOrgId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <LiveEventsSection selectedOrgId={selectedOrgId} searchQuery={searchQuery} />
      <FeaturesSection />
      <LeaderboardSection />
      <Footer />
    </div>
  );
};

export default Index;
