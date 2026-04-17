import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Calendar, Users, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { icon: Calendar, value: "120+", label: "Events" },
  { icon: Users, value: "8,500+", label: "Participants" },
  { icon: Trophy, value: "45", label: "Colleges" },
];

// Floating particles component
const Particles = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? "hsl(var(--primary))"
              : p.id % 3 === 1
              ? "hsl(var(--accent))"
              : "hsl(var(--foreground) / 0.3)",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orbs
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)",
        left: "10%",
        top: "20%",
      }}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
      style={{
        background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)",
        right: "5%",
        bottom: "10%",
      }}
      animate={{
        x: [0, -40, 30, 0],
        y: [0, 30, -50, 0],
        scale: [1, 0.9, 1.15, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
      style={{
        background: "radial-gradient(circle, hsl(var(--success)), transparent 70%)",
        left: "50%",
        top: "60%",
      }}
      animate={{
        x: [0, 60, -20, 0],
        y: [0, -20, 40, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const parallaxX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-15, 15]);
  const parallaxXSlow = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const parallaxYSlow = useTransform(springY, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 80%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 20% 60%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
              hsl(var(--background))
            `,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <GradientOrbs />
      <Particles />

      {/* Grid lines */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Horizontal scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <motion.div
          style={{ x: parallaxXSlow, y: parallaxYSlow }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Live Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 relative"
          >
            <div className="absolute inset-0 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-sm" />
            <div className="absolute inset-0 rounded-full animate-pulse bg-primary/5" />
            <span className="relative w-2 h-2 rounded-full bg-success live-pulse" />
            <span className="relative text-xs font-semibold text-primary tracking-widest uppercase">
              TechFest 2026 is Live
            </span>
            <Sparkles className="relative w-3 h-3 text-primary" />
          </motion.div>

          {/* Main headline with glow */}
          <motion.div
            style={{ x: parallaxX, y: parallaxY }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-8"
            >
              <span className="block text-foreground">The Future of</span>
              <span
                className="block mt-2 bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                  backgroundSize: "200% 200%",
                  animation: "gradient-shift 4s ease infinite",
                  filter: "drop-shadow(0 0 40px hsl(var(--primary) / 0.4))",
                }}
              >
                College Events
              </span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A centralized ecosystem where colleges compete, collaborate, and celebrate.
            Real-time scoring, AI-powered scheduling, and seamless participation.
          </motion.p>

          {/* CTA Buttons with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 mb-20"
          >
            <Link to="/events">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                <Button size="lg" className="relative px-10 h-14 text-base font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 rounded-xl">
                  Explore Events
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats with glow dividers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-10 md:gap-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center relative"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {i > 0 && (
                  <div className="absolute -left-5 md:-left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                )}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-3xl md:text-4xl font-black tracking-tight">{stat.value}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};
