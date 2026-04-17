import { motion } from "framer-motion";
import { Brain, Zap, Shield, BarChart3, Award, Bell, QrCode, Globe } from "lucide-react";

const features = [
  { icon: Zap, title: "Real-Time Scoring", desc: "Instant leaderboard updates with animated transitions and live audience voting." },
  { icon: Brain, title: "AI-Powered", desc: "Smart scheduling, conflict detection, and participation analytics powered by AI." },
  { icon: Shield, title: "Blind Judging", desc: "Unbiased evaluation with configurable criteria and weighted scoring systems." },
  { icon: BarChart3, title: "Deep Analytics", desc: "Track trends, predict delays, and monitor participation across all events." },
  { icon: Award, title: "Digital Certificates", desc: "Auto-generated certificates with QR verification and bulk distribution." },
  { icon: Bell, title: "Smart Alerts", desc: "Context-aware notifications — 'You're next', 'Results out', 'Starts in 10 min'." },
  { icon: QrCode, title: "QR Check-in", desc: "Seamless participant check-in with real-time attendance tracking." },
  { icon: Globe, title: "Public Showcase", desc: "Premium event landing pages with sponsor sections and winner archives." },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4 block">
            Platform Features
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Everything you need,
            <br />
            <span className="text-muted-foreground">nothing you don't</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.3, type: "spring", stiffness: 300 } }}
              className="group relative"
            >
              <div className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40 transition-all duration-500 group-hover:border-primary/30 group-hover:bg-card/70 group-hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.2)] h-full">
                {/* Icon with glow */}
                <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="font-bold mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
