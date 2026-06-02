import { useState, useEffect } from "react";
import { Video, Mic, MessageSquare, Shield, User, Info, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";

export default function InterviewRoom() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  const mockDialogue = [
    "Interviewer: Hello Ahmed, can you hear me clearly?",
    "Ahmed: Yes, I can hear you well.",
    "Interviewer: Great! We're excited to discuss the Frontend role at Jazz.",
    "Interviewer: Can you tell us about your experience with accessibility?",
    "Ahmed: Absolutely. I specialize in ARIA compliance and keyboard navigation.",
  ];

  useEffect(() => {
    if (!isActive) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockDialogue.length) {
        setCaptions(prev => [...prev, mockDialogue[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">J</div>
          <div>
            <h1 className="text-sm font-bold">Jazz Talent Acquisition</h1>
            <p className="text-xxs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secure Interview Hub
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-600 text-xxs font-bold border border-red-500/50 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
          </div>
          <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
        {/* Video Area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex-1 relative rounded-2xl bg-slate-900 border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-20 h-20 text-white/10" />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
              Interviewer: Sarah Malik
            </div>
          </div>

          {/* Real-time Captions Area */}
          <div className="h-32 bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Info className="w-3 h-3" />
              <span className="text-xxs font-black uppercase tracking-widest">Real-Time Captioning (Enabled)</span>
            </div>
            {!isActive ? (
              <div className="flex items-center justify-center h-full">
                <Button onClick={() => setIsActive(true)} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                  Start Mock Interview Session
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {captions.map((c, i) => {
                  if (!c) return null;
                  const isInterviewer = c.startsWith("Interviewer:");
                  const [label, ...textParts] = c.split(":");
                  const text = textParts.join(":");
                  return (
                    <FadeIn key={i} direction="none" duration={0.3}>
                      <p className="text-sm font-medium leading-relaxed">
                        <span className={isInterviewer ? "text-blue-400 font-bold" : "text-green-400 font-bold"}>
                          {label}:
                        </span>
                        {text}
                      </p>
                    </FadeIn>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-4">
          <div className="aspect-video relative rounded-2xl bg-slate-900 border border-white/5 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-10 h-10 text-white/10" />
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xxs font-medium border border-white/10">
              You (Ahmed Khan)
            </div>
          </div>

          <Card className="bg-slate-900 border-white/5 flex-1 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold">Interview Controls</span>
              <MoreVertical className="w-4 h-4 text-white/40" />
            </div>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10">
                <Mic className="w-4 h-4" /> Mute Audio
              </Button>
              <Button className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10">
                <Video className="w-4 h-4" /> Stop Video
              </Button>
              <Button className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10">
                <MessageSquare className="w-4 h-4" /> Accessibility Chat
              </Button>
              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="text-xxs text-white/40 mb-3 uppercase font-black">Support Assistant</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">C</div>
                  <div>
                    <p className="text-xs font-bold">TEB Captain</p>
                    <p className="text-xxs text-blue-400">Online & Ready</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full font-bold">End Interview</Button>
        </div>
      </main>
    </div>
  );
}
