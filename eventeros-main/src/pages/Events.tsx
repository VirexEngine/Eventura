import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Clock, MapPin, Users, Calendar, Star, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { EventRegisterModal } from "@/components/EventRegisterModal";

const categories = ["All", "Tech", "Cultural", "Sports", "Design", "Science"];

const events = [
  { id: 1, name: "Code Sprint 3.0", orgName: "TechFest IIT", orgLogo: "T", category: "Tech", status: "live", time: "Now", venue: "Hall A", participants: 120, maxParticipants: 150, description: "48-hour coding marathon with real-world challenges.", featured: true },
  { id: 2, name: "RoboWars Championship", orgName: "Robotics Club", orgLogo: "R", category: "Tech", status: "live", time: "Now", venue: "Arena B", participants: 64, maxParticipants: 64, description: "Battle bots face off in the ultimate arena showdown." },
  { id: 3, name: "Dance Battle Royale", orgName: "Cultural Committee", orgLogo: "C", category: "Cultural", status: "upcoming", time: "2:00 PM", venue: "Main Stage", participants: 32, maxParticipants: 48, description: "Freestyle dance competition with live DJ." },
  { id: 4, name: "UI/UX Designathon", orgName: "Design Council", orgLogo: "D", category: "Design", status: "upcoming", time: "3:00 PM", venue: "Lab 3", participants: 85, maxParticipants: 100, description: "Design solutions for real-world UX problems." },
  { id: 5, name: "AI Paper Presentation", orgName: "TechFest IIT", orgLogo: "T", category: "Science", status: "upcoming", time: "4:30 PM", venue: "Auditorium", participants: 42, maxParticipants: 50, description: "Present your latest AI research to expert judges." },
  { id: 6, name: "Basketball 3v3", orgName: "Sports Board", orgLogo: "S", category: "Sports", status: "completed", time: "Ended", venue: "Court A", participants: 48, maxParticipants: 48, description: "Fast-paced 3v3 basketball tournament." },
];

type EventStatus = "live" | "upcoming" | "completed";

const statusConfig: Record<EventStatus, { label: string; class: string }> = {
  live: { label: "LIVE", class: "bg-live/20 text-live border-live/30" },
  upcoming: { label: "UPCOMING", class: "bg-warning/20 text-warning border-warning/30" },
  completed: { label: "ENDED", class: "bg-muted text-muted-foreground border-border" },
};

const Events = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalEvent, setActiveModalEvent] = useState<{name: string, id: number} | null>(null);

  const filtered = events.filter(e => {
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-1">Discover Events</h1>
            <p className="text-muted-foreground">Find and register for events across all colleges</p>
          </motion.div>

          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card-hover p-5 flex flex-col group cursor-pointer ${
                  event.featured ? "md:col-span-2 lg:col-span-1 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3" onClick={() => {/* Navigate to event detail */}}>
                  <div className="flex flex-col gap-2">
                    <span className={`text-[10px] inline-flex items-center w-max font-bold px-2 py-0.5 rounded-md border ${statusConfig[event.status as EventStatus].class}`}>
                      {event.status === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-live live-pulse mr-1" />}
                      {statusConfig[event.status as EventStatus].label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {event.orgLogo}
                      </div>
                      <span className="text-xs font-semibold text-foreground/80">{event.orgName}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    <Tag className="w-3 h-3" /> {event.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors" onClick={() => {/* Navigate to event detail */}}>
                  {event.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2" onClick={() => {/* Navigate to event detail */}}>{event.description}</p>

                <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground mb-4" onClick={() => {/* Navigate to event detail */}}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                </div>

                {/* Capacity bar */}
                <div className="mb-4" onClick={() => {/* Navigate to event detail */}}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.participants}/{event.maxParticipants}
                    </span>
                    <span className={event.participants >= event.maxParticipants ? "text-live" : "text-success"}>
                      {event.participants >= event.maxParticipants ? "Full" : "Open"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        event.participants >= event.maxParticipants
                          ? "bg-live"
                          : "bg-gradient-to-r from-primary to-accent"
                      }`}
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={event.status === "completed" ? "outline" : "default"}
                  disabled={event.participants >= event.maxParticipants && event.status !== "completed"}
                  className={event.status !== "completed" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 mt-auto" : "mt-auto"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (event.status !== "completed") {
                      setActiveModalEvent({ name: event.name, id: event.id });
                    }
                  }}
                >
                  {event.status === "completed" ? "View Results" : event.participants >= event.maxParticipants ? "Waitlist" : "Register Now"}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <EventRegisterModal 
        isOpen={!!activeModalEvent} 
        onClose={() => setActiveModalEvent(null)} 
        eventName={activeModalEvent?.name || ""} 
      />
    </div>
  );
};

export default Events;
