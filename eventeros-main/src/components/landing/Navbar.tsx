import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Search, ChevronLeft, ChevronRight, Cpu, Command, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const navLinks = [
  { label: "Organisations", href: "#organisations" },
  { label: "Events", href: "#events" },
  { label: "Features", href: "#features" },
  { label: "Leaderboard", href: "#leaderboard" },
];

const navItems = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'processor', label: 'Processor', icon: Cpu },
  { id: 'commands', label: 'Commands', icon: Command },
  { id: 'power', label: 'Power', icon: Zap },
  { id: 'select', label: 'Select', icon: MousePointer2 }
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(2);

  const handleSearchToggle = () => setSearchOpen(!searchOpen);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchValue);
  };
  const goPrevious = () => console.log("Previous");
  const goNext = () => console.log("Next");

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-3">
        <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_4px_30px_-5px_hsl(0_0%_0%/0.5)]">
          <div className="container mx-auto flex items-center justify-between h-14 px-5">
            <Link to="/" className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              >
                <Zap className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-lg tracking-tight">EventOS</span>
            </Link>

            <div className="flex flex-col items-center justify-start flex-1 mx-4 relative h-[180px] w-full mt-2">
              {/* Header Section: Search + Arrows */}
              <div className="w-full max-w-md flex justify-between px-6 z-[100] relative mb-6">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSearchToggle}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transition hover:bg-zinc-800"
                    aria-label="Toggle search"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  {searchOpen && (
                    <motion.form 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      className="absolute left-16 right-28 px-2 z-[100]"
                    >
                      <input
                        type="text"
                        value={searchValue}
                        onChange={handleChange}
                        className="w-full h-10 rounded-full border border-zinc-700 bg-black/80 backdrop-blur-md px-4 text-white placeholder-zinc-400 outline-none shadow-lg focus:ring-1 focus:ring-zinc-500"
                        placeholder="Search items..."
                      />
                    </motion.form>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((prev) => (prev - 1 + navItems.length) % navItems.length)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Previous navigator"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveIndex((prev) => (prev + 1) % navItems.length)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Next navigator"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Carousel Section: The 3D Dial */}
              <div className="relative flex items-center justify-center w-full perspective-[1200px]">
                <AnimatePresence mode="popLayout">
                  {navItems.map((item, index) => {
                    let offset = index - activeIndex;
                    if (offset > navItems.length / 2) offset -= navItems.length;
                    if (offset < -navItems.length / 2) offset += navItems.length;

                    const isActive = offset === 0;

                    return (
                      <motion.div
                        key={item.id}
                        initial={false}
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                          x: offset * 90,
                          y: Math.abs(offset) * 8,
                          scale: isActive ? 1.1 : 0.7,
                          opacity: isActive ? 1 : 0.4,
                          rotateY: offset * -15,
                          filter: isActive ? "blur(0px)" : "blur(4px)",
                          zIndex: isActive ? 10 : 5 - Math.abs(offset)
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 35,
                          mass: 0.5
                        }}
                        className={`absolute flex items-center justify-center rounded-2xl h-14 w-14 sm:h-16 sm:w-16 shadow-lg transition-colors cursor-pointer ${
                          isActive 
                            ? "bg-white text-black border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                            : "bg-zinc-900/50 text-white border border-zinc-800"
                        }`}
                        onClick={() => setActiveIndex(index)}
                      >
                        <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isActive ? 'text-black' : 'text-zinc-300'}`} />

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 15, scale: 0.9 }}
                              animate={{ opacity: 1, y: -50, scale: 1 }}
                              exit={{ opacity: 0, y: 15, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-0 px-3 py-1 font-medium bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm rounded-full whitespace-nowrap shadow-xl"
                            >
                              {item.label}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <ProfileDropdown user={user!} onLogout={logout} />
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                      Login
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden border-t border-border/30"
              >
                <div className="p-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <a key={link.label} href={link.href} className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-secondary/50">{link.label}</a>
                  ))}
                  <div className="border-t border-border/30 pt-2 mt-1">
                    {isAuthenticated ? (
                      <button onClick={logout} className="text-sm text-primary py-2 px-3 rounded-lg hover:bg-primary/10 w-full text-left">
                        Logout
                      </button>
                    ) : (
                      <Link to="/login">
                        <button className="text-sm text-primary py-2 px-3 rounded-lg hover:bg-primary/10 w-full text-left">
                          Login →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};
