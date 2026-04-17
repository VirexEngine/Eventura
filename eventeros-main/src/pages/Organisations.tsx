import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { OrgJoinModal } from "@/components/OrgJoinModal";

const organisations = [
  { id: "org1", name: "TechFest IIT", logo: "T", members: 1200, eventsCount: 12, tags: ["Tech", "Hackathons"], description: "The official technology board of IIT, hosting the biggest tech festivals." },
  { id: "org2", name: "Design Council", logo: "D", members: 450, eventsCount: 4, tags: ["Design", "UI/UX", "Art"], description: "Creative minds collaborating on design solutions and aesthetic experiences." },
  { id: "org3", name: "Robotics Club", logo: "R", members: 800, eventsCount: 8, tags: ["Robotics", "Hardware"], description: "Building the future with autonomous bots and hardware projects." },
  { id: "org4", name: "Cultural Committee", logo: "C", members: 2000, eventsCount: 20, tags: ["Dance", "Music", "Drama"], description: "Celebrating arts, culture, and talent." },
  { id: "org5", name: "Sports Board", logo: "S", members: 1500, eventsCount: 5, tags: ["Sports", "Athletics"], description: "Promoting physical fitness and competitive sports." },
];

const Organisations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalOrg, setActiveModalOrg] = useState<{name: string, id: string} | null>(null);

  const filtered = organisations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-1">Organisations</h1>
            <p className="text-muted-foreground">Discover and join clubs, committees, and boards.</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search organisations or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card-hover p-6 flex flex-col group cursor-pointer border border-border/50 hover:border-primary/40 rounded-2xl bg-card"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg ring-1 ring-primary/30 group-hover:scale-110 transition-transform shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                    {org.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{org.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {org.members}</span>
                      <span className="flex items-center gap-1"><span className="material-icons-round text-[12px]">event</span> {org.eventsCount}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{org.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {org.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded border border-border/50 bg-secondary text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border/50"
                  >
                    View Events
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    onClick={() => setActiveModalOrg({ name: org.name, id: org.id })}
                  >
                    Join
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <OrgJoinModal 
        isOpen={!!activeModalOrg} 
        onClose={() => setActiveModalOrg(null)} 
        orgName={activeModalOrg?.name || ""} 
      />
    </div>
  );
};

export default Organisations;
