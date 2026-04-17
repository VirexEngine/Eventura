import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, EyeOff, ChevronRight, Send, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";

interface Criterion {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  value: number;
}

const initialCriteria: Criterion[] = [
  { id: "1", name: "Technical Execution", weight: 30, maxScore: 10, value: 0 },
  { id: "2", name: "Creativity & Innovation", weight: 25, maxScore: 10, value: 0 },
  { id: "3", name: "Presentation Quality", weight: 20, maxScore: 10, value: 0 },
  { id: "4", name: "Problem Solving", weight: 15, maxScore: 10, value: 0 },
  { id: "5", name: "Team Collaboration", weight: 10, maxScore: 10, value: 0 },
];

const participants = [
  { id: 1, team: "ByteForce", college: "IIT Delhi", scored: true, totalScore: 87 },
  { id: 2, team: "QuantumLeap", college: "BITS Pilani", scored: true, totalScore: 82 },
  { id: 3, team: "NeuralNets", college: "NIT Trichy", scored: false, totalScore: 0 },
  { id: 4, team: "CodeCraft", college: "IIT Bombay", scored: false, totalScore: 0 },
  { id: 5, team: "DataDriven", college: "IIIT Hyderabad", scored: false, totalScore: 0 },
];

const JudgePanel = () => {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [blindMode, setBlindMode] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  const updateScore = (id: string, value: number) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, value } : c));
  };

  const weightedTotal = criteria.reduce((sum, c) => sum + (c.value / c.maxScore) * c.weight, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">Judge Panel</h1>
              <p className="text-muted-foreground">Code Sprint 3.0 — Round 2</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlindMode(!blindMode)}
                className="gap-2"
              >
                {blindMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {blindMode ? "Blind Mode ON" : "Blind Mode OFF"}
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Participant List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 glass-card p-4"
            >
              <h2 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
                Queue ({participants.filter(p => !p.scored).length} remaining)
              </h2>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <motion.button
                    key={p.id}
                    onClick={() => setActiveParticipant(i)}
                    className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                      activeParticipant === i
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/30 hover:bg-secondary/60 border border-transparent"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      p.scored ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {p.scored ? <Check className="w-4 h-4" /> : `#${p.id}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {blindMode ? `Team ${p.id}` : p.team}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {blindMode ? "Hidden" : p.college}
                      </p>
                    </div>
                    {p.scored && (
                      <span className="text-sm font-mono font-bold text-primary">{p.totalScore}</span>
                    )}
                    {activeParticipant === i && (
                      <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Scoring Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8"
            >
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      {blindMode ? `Team ${participants[activeParticipant].id}` : participants[activeParticipant].team}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {blindMode ? "Identity hidden" : participants[activeParticipant].college}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black font-mono gradient-text">
                      {weightedTotal.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100 weighted</div>
                  </div>
                </div>

                {/* Scoring Sliders */}
                <div className="space-y-6">
                  {criteria.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                            {c.weight}%
                          </span>
                        </div>
                        <span className="text-lg font-bold font-mono text-primary">
                          {c.value}
                          <span className="text-xs text-muted-foreground">/{c.maxScore}</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max={c.maxScore}
                          step="0.5"
                          value={c.value}
                          onChange={(e) => updateScore(c.id, parseFloat(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--glow-primary)/0.5)]
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-shadow
                            [&::-webkit-slider-thumb]:hover:shadow-[0_0_20px_hsl(var(--glow-primary)/0.8)]"
                        />
                        <div
                          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary to-accent pointer-events-none"
                          style={{ width: `${(c.value / c.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="mt-8 flex items-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 flex-1 md:flex-none"
                  >
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                          <Check className="w-4 h-4" /> Submitted!
                        </motion.span>
                      ) : (
                        <motion.span key="submit" className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Submit Score
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </div>

              {/* Mini Leaderboard */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" /> Live Rankings
                </h3>
                <div className="space-y-2">
                  {participants
                    .filter(p => p.scored)
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                        <span className="text-xs font-bold text-warning w-4">#{i + 1}</span>
                        <span className="text-sm flex-1">{blindMode ? `Team ${p.id}` : p.team}</span>
                        <span className="font-mono font-bold text-primary">{p.totalScore}</span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;
