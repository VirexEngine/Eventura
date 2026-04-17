import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface OrganisationsSectionProps {
  onOrgSelect: (orgId: string | null) => void;
  selectedOrgId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const organisations = [
  { id: "org1", name: "TechFest IIT", logo: "T", eventsCount: 12 },
  { id: "org2", name: "Design Council", logo: "D", eventsCount: 4 },
  { id: "org3", name: "Robotics Club", logo: "R", eventsCount: 8 },
  { id: "org4", name: "Cultural Committee", logo: "C", eventsCount: 20 },
  { id: "org5", name: "Sports Board", logo: "S", eventsCount: 5 },
];

export const OrganisationsSection = ({ 
  onOrgSelect, selectedOrgId, searchQuery, onSearchChange 
}: OrganisationsSectionProps) => {

  const filteredOrgs = organisations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="organisations" className="py-16 relative bg-card/30 border-y border-border/30">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter mb-6 text-center">
            Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Events</span>
          </h2>
          
          <div className="w-full max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-card/50 border border-border/50 rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-[0_0_15px_hsl(var(--primary)/0.1)] focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOrgSelect(null)}
            className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full border transition-all snap-start ${
              selectedOrgId === null 
                ? 'bg-primary/20 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' 
                : 'bg-card border-border/50 hover:border-primary/50'
            }`}
          >
            <span className="font-semibold text-sm">All Events</span>
          </motion.button>

          {filteredOrgs.map((org) => (
            <motion.button
              key={org.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOrgSelect(org.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all snap-start ${
                selectedOrgId === org.id 
                  ? 'bg-primary/20 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' 
                  : 'bg-card border-border/50 hover:border-primary/50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                {org.logo}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">{org.name}</span>
                <span className="text-[10px] text-muted-foreground tracking-wider font-semibold opacity-70">{org.eventsCount} Events</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
