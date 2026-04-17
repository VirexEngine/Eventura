import { motion } from "framer-motion";
import { Zap, Github, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="relative border-t border-border/30 py-16 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/5 rounded-full blur-[100px]" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
        >
          <Zap className="w-6 h-6 text-primary-foreground" />
        </motion.div>

        <p className="text-sm text-muted-foreground text-center max-w-md">
          The future of inter-college event management. Built for organizers, judges, and participants.
        </p>

        <p className="text-xs text-muted-foreground/60">
          © 2026 EventOS. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
