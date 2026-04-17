import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
}

export const EventRegisterModal = ({ isOpen, onClose, eventName }: EventRegisterModalProps) => {
  const [specificCode, setSpecificCode] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-primary/15 rounded-[18px] p-6 shadow-2xl overflow-hidden"
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-full h-32 bg-primary/10 blur-[50px] -z-10 rounded-full" />

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Register for Event</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <span className="material-icons-round">close</span>
            </button>
          </div>
          
          <div className="mb-6 pb-4 border-b border-border/50">
            <p className="text-sm text-primary font-semibold">Event Name: {eventName}</p>
          </div>

          <div className="space-y-4">
            <div className="tf">
              <div className="tf-label text-xs mb-1.5 font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="material-icons-round text-[14px]">vpn_key</span>
                Event Specific Code <span className="opacity-50 font-normal">(optional)</span>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Only if private event"
                  value={specificCode}
                  onChange={(e) => setSpecificCode(e.target.value)}
                  className="w-full bg-black/20 border border-primary/20 rounded-lg py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="tf">
              <div className="tf-label text-xs mb-1.5 font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="material-icons-round text-[14px]">business</span>
                Organisation Code <span className="text-live">*</span>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Required for inter-college"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  className="w-full bg-black/20 border border-primary/20 rounded-lg py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="tf">
              <div className="tf-label text-xs mb-1.5 font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="material-icons-round text-[14px]">groups</span>
                Team/Group Name <span className="opacity-50 font-normal">(optional)</span>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Code Ninjas"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-black/20 border border-primary/20 rounded-lg py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="tf">
              <div className="tf-label text-xs mb-1.5 font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="material-icons-round text-[14px]">lock</span>
                Password <span className="text-live">*</span>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="Confirm with your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-primary/20 rounded-lg py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-secondary/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!orgCode || !password) return alert("Organisation Code and Password are required");
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity flex justify-center items-center gap-1 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <span>Register</span>
              <span className="material-icons-round text-[16px]">arrow_forward</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
