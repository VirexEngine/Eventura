import { motion } from "framer-motion";
import { Trophy, TrendingUp, Medal, Crown } from "lucide-react";

const colleges = [
  { rank: 1, name: "IIT Delhi", points: 2850, events: 34, wins: 12, trend: "+180" },
  { rank: 2, name: "BITS Pilani", points: 2640, events: 31, wins: 10, trend: "+95" },
  { rank: 3, name: "NIT Trichy", points: 2410, events: 28, wins: 8, trend: "+120" },
  { rank: 4, name: "IIT Bombay", points: 2280, events: 26, wins: 7, trend: "+65" },
  { rank: 5, name: "IIIT Hyderabad", points: 2150, events: 24, wins: 6, trend: "+45" },
];

const rankIcons = [Crown, Medal, Trophy];
const rankGradients = [
  "from-yellow-400/20 to-amber-600/20 border-yellow-500/30",
  "from-slate-300/20 to-slate-500/20 border-slate-400/30",
  "from-orange-400/20 to-orange-600/20 border-orange-500/30",
];

export const LeaderboardSection = () => {
  return (
    <section id="leaderboard" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[120px]" />
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
            Rankings
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            College{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
              Leaderboard
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {colleges.map((college, i) => {
            const RankIcon = i < 3 ? rankIcons[i] : null;
            return (
              <motion.div
                key={college.rank}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="group cursor-default"
              >
                <div className={`relative p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 group-hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.15)] ${
                  i < 3
                    ? `bg-gradient-to-r ${rankGradients[i]}`
                    : "bg-card/40 border-border/40 group-hover:border-primary/20"
                }`}>
                  <div className="flex items-center gap-5">
                    {/* Rank */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-card/60">
                      {RankIcon ? (
                        <RankIcon className={`w-6 h-6 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : "text-orange-400"}`} />
                      ) : (
                        <span className="text-lg font-black text-muted-foreground">#{college.rank}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg tracking-tight">{college.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {college.events} events participated · {college.wins} wins
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono tracking-tight">
                          {college.points.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-xs font-semibold text-success">+{college.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar showing relative score */}
                  <div className="mt-3 w-full h-1 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(college.points / 3000) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
