import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin, Users, Lock, Unlock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [codes, setCodes] = useState({ orgCode: "", specificCode: "" });
  
  const [form, setForm] = useState({
    name: "", orgId: "", category: "Tech", date: "", time: "", venue: "", description: "", maxParticipants: 50
  });

  const handleCreate = () => {
    if (!form.name || !form.orgId) return alert("Please fill at least name and organisation.");
    const generatedOrgCode = "ORG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedSpecificCode = isPrivate ? "EVT-" + Math.random().toString(36).substring(2, 8).toUpperCase() : "";
    setCodes({ orgCode: generatedOrgCode, specificCode: generatedSpecificCode });
    setShowSuccess(true);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Create Event</h1>
        <p className="text-muted-foreground text-sm mt-1">Host a new event, competition, or workshop.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Event Name</Label>
            <Input 
              placeholder="e.g. Code Sprint 3.0" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label>Organisation</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.orgId} 
              onChange={e => setForm({...form, orgId: e.target.value})}
            >
              <option value="" disabled>Select Organisation</option>
              {user?.organisations?.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option value="Tech">Tech</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Design">Design</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="date" className="pl-9" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="time" className="pl-9" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Venue</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="e.g. Main Auditorium" className="pl-9" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what the event is about..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Participant Limit</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="number" min="1" className="pl-9" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <div className="flex items-center gap-4 mt-2">
              <button 
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md border ${!isPrivate ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-input text-muted-foreground hover:bg-secondary'}`}
              >
                <Unlock className="w-4 h-4" /> Public
              </button>
              <button 
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md border ${isPrivate ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-input text-muted-foreground hover:bg-secondary'}`}
              >
                <Lock className="w-4 h-4" /> Private
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
          <Button className="bg-gradient-to-r from-primary to-accent" onClick={handleCreate}>Create Event</Button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-card border border-primary/20 rounded-[18px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Event Created!</h2>
              <p className="text-muted-foreground text-sm mb-6">Share these codes with users so they can register for your event.</p>
              
              <div className="space-y-4 mb-8 text-left">
                <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Organisation Code</p>
                  <p className="font-mono text-lg font-bold text-primary tracking-widest">{codes.orgCode}</p>
                </div>
                {isPrivate && (
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Specific Code
                    </p>
                    <p className="font-mono text-lg font-bold text-accent tracking-widest">{codes.specificCode}</p>
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
