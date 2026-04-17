import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Clock, MapPin, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";

import eventCode from "@/assets/event-code.jpg";
import eventRobo from "@/assets/event-robo.jpg";
import eventDance from "@/assets/event-dance.jpg";
import eventDesign from "@/assets/event-design.jpg";
import eventAi from "@/assets/event-ai.jpg";
import eventSports from "@/assets/event-sports.jpg";

type EventStatus = "live" | "upcoming" | "completed";

const events = [
  { id: 1, name: "Code Sprint 3.0", category: "TECH", status: "live" as EventStatus, time: "Happening Now", venue: "Hall A", participants: 120, image: eventCode, description: "48-hour coding marathon with real-world challenges" },
  { id: 2, name: "RoboWars Championship", category: "TECH", status: "live" as EventStatus, time: "Happening Now", venue: "Arena B", participants: 64, image: eventRobo, description: "Battle bots face off in the ultimate arena showdown" },
  { id: 3, name: "Dance Battle Royale", category: "CULTURAL", status: "upcoming" as EventStatus, time: "2:00 PM Today", venue: "Main Stage", participants: 32, image: eventDance, description: "Freestyle dance competition with live DJ" },
  { id: 4, name: "UI/UX Designathon", category: "DESIGN", status: "upcoming" as EventStatus, time: "3:00 PM Today", venue: "Lab 3", participants: 85, image: eventDesign, description: "Design solutions for real-world UX problems" },
  { id: 5, name: "AI Paper Presentation", category: "SCIENCE", status: "upcoming" as EventStatus, time: "4:30 PM Today", venue: "Auditorium", participants: 42, image: eventAi, description: "Present your latest AI research to expert judges" },
  { id: 6, name: "Basketball 3v3", category: "SPORTS", status: "completed" as EventStatus, time: "Ended", venue: "Court A", participants: 48, image: eventSports, description: "Fast-paced 3v3 basketball tournament" },
];

const statusConfig: Record<EventStatus, { label: string; dotClass: string; badgeClass: string }> = {
  live: { label: "LIVE", dotClass: "bg-live live-pulse", badgeClass: "bg-live/20 text-live border-live/40" },
  upcoming: { label: "SOON", dotClass: "bg-warning", badgeClass: "bg-warning/20 text-warning border-warning/40" },
  completed: { label: "ENDED", dotClass: "bg-muted-foreground", badgeClass: "bg-muted/50 text-muted-foreground border-border" },
};

const EventPosterCard = ({ event, index }: { event: typeof events[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouse = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const status = statusConfig[event.status];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]">
        {/* Image with zoom + overlay */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            width={640}
            height={896}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Glow edge on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 100%, hsl(var(--primary) / 0.15), transparent 60%)",
            }}
          />

          {/* Status badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border backdrop-blur-sm ${status.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </div>
          </div>

          {/* Category */}
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/60 bg-card/40 backdrop-blur-sm px-2 py-1 rounded-md">
              {event.category}
            </span>
          </div>

          {/* Arrow reveal on hover */}
          <motion.div
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2"
          >
            <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5 -mt-16 relative z-10">
          <h3 className="text-xl font-bold mb-1 tracking-tight group-hover:text-primary transition-colors duration-300">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary/60" />
              {event.venue}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary/60" />
              {event.participants}
            </span>
          </div>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
};

export const LiveEventsSection = ({ selectedOrgId, searchQuery }: { selectedOrgId?: string | null, searchQuery?: string }) => {
  const eventsWithOrgs = events.map((e, index) => ({
    ...e,
    orgId: `org${(index % 5) + 1}`,
  }));

  const filteredEvents = eventsWithOrgs.filter(e => {
    const matchesOrg = selectedOrgId ? e.orgId === selectedOrgId : true;
    const matchesSearch = searchQuery ? e.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesOrg && matchesSearch;
  });

  return (
    <section id="events" className="py-28 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-live live-pulse" />
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">Live Feed</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            What's happening{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">now</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover live events, upcoming competitions, and past highlights across all colleges.
          </p>
        </motion.div>

        {/* Poster grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <EventPosterCard key={event.id} event={event} index={i} />
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/events">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline underline-offset-4"
            >
              View all events <ArrowUpRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
