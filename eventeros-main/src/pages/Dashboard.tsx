import { motion } from "framer-motion";
import { 
  Calendar, Users, Trophy, TrendingUp, ArrowUpRight, Activity,
  Clock, Zap, BarChart3, Bell, ChevronRight, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";

const statCards = [
  { label: "Total Events", value: "48", change: "+12%", icon: Calendar, color: "text-primary" },
  { label: "Participants", value: "3,240", change: "+28%", icon: Users, color: "text-success" },
  { label: "Colleges", value: "45", change: "+5", icon: Trophy, color: "text-warning" },
  { label: "Live Now", value: "6", change: "", icon: Activity, color: "text-live" },
];

const liveEvents = [
  { name: "Code Sprint 3.0", venue: "Hall A", participants: 120, progress: 65 },
  { name: "RoboWars", venue: "Arena B", participants: 64, progress: 40 },
  { name: "Dance Battle", venue: "Main Stage", participants: 32, progress: 80 },
];

const upcomingEvents = [
  { name: "AI Hackathon", time: "2:00 PM", venue: "Lab 3" },
  { name: "Quiz Finals", time: "3:30 PM", venue: "Auditorium" },
  { name: "Photography Contest", time: "4:00 PM", venue: "Gallery" },
];

const recentActivity = [
  { text: "Code Sprint 3.0 scoring started", time: "2 min ago", icon: Zap },
  { text: "Team 'ByteForce' checked in", time: "5 min ago", icon: Users },
  { text: "RoboWars Round 2 completed", time: "12 min ago", icon: Trophy },
  { text: "New judge assigned to Quiz Finals", time: "18 min ago", icon: BarChart3 },
];

const Dashboard = () => {
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
            <h1 className="text-3xl font-bold mb-1">Command Center</h1>
            <p className="text-muted-foreground">TechFest 2026 — Day 2 of 3</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  {stat.change && (
                    <span className="flex items-center text-xs text-success font-medium">
                      <ArrowUpRight className="w-3 h-3" />{stat.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-live live-pulse" />
                  <h2 className="font-semibold">Live Events</h2>
                </div>
                <span className="text-xs text-muted-foreground">{liveEvents.length} active</span>
              </div>

              <div className="space-y-4">
                {liveEvents.map((event) => (
                  <div key={event.name} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-sm">{event.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participants}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-primary">{event.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${event.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Activity
                </h2>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <activity.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{activity.text}</p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Upcoming */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" /> Upcoming
              </h2>
              <Link to="#" className="text-xs text-primary flex items-center gap-1">
                View schedule <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.name} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer">
                  <h3 className="font-medium text-sm mb-2">{event.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
