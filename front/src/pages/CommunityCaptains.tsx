import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, MapPin, Star, CheckCircle2, ArrowRight, MessageCircle,
  X, Loader2, ClipboardList, Clock, UserCheck, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SignInButton } from "@clerk/react";
import { AuthGuard } from "@/App";
import { api, type Captain, type CaptainSession } from "@/lib/api";
import { appPath } from "@/lib/basePath";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { Sparkles, GraduationCap, Briefcase, Heart } from "lucide-react";

const howItWorks = [
  {
    step: "1",
    title: "Browse Captains",
    description: "Find a Captain in your area with expertise matching your needs.",
  },
  {
    step: "2",
    title: "Request a Session",
    description: "Schedule a free one-on-one mentoring session at your convenience.",
  },
  {
    step: "3",
    title: "Get Mentored",
    description: "Receive personalized guidance, job leads, and community connections.",
  },
  {
    step: "4",
    title: "Pay It Forward",
    description: "Once you're established, consider becoming a Captain yourself.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-gray-50 text-gray-500 border-gray-200",
};

function RequestSessionModal({
  captain,
  onClose,
}: {
  captain: Captain;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.captains.requestSession(captain.id, { message: message || undefined }),
    onSuccess: () => {
      toast({
        title: "Session requested!",
        description: `${captain.displayName} will review your request soon.`,
      });
      qc.invalidateQueries({ queryKey: ["captains"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Request a Session</h2>
            <p className="text-sm text-muted-foreground">with {captain.displayName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Your Message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them what kind of help you're looking for..."
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
            <Button
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              style={{ background: "hsl(262 83% 58%)" }}
              className="text-white"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptainDashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["captain-profile"],
    queryFn: api.captains.myProfile,
    retry: (failureCount, err) => {
      if (err instanceof Error && err.message.includes("403")) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["captain-requests"],
    queryFn: api.captains.myRequests,
    retry: (failureCount, err) => {
      if (err instanceof Error && err.message.includes("403")) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: string }) =>
      api.captains.updateRequest(sessionId, status),
    onSuccess: (_, { status }) => {
      toast({
        title: status === "completed" ? "Marked as completed!" : status === "accepted" ? "Session accepted!" : "Session declined",
        description: status === "completed" ? "Your success count has been updated." : undefined,
      });
      qc.invalidateQueries({ queryKey: ["captain-requests"] });
      qc.invalidateQueries({ queryKey: ["captain-profile"] });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (profileLoading || requestsLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your captain dashboard...
      </div>
    );
  }

  if (!profile) return null;

  const sessions = requestsData?.sessions ?? [];

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-900" />
            My Captain Dashboard
          </h2>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{profile.assignedCount}</div>
              <div className="text-xs text-muted-foreground">Mentored</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "hsl(142 76% 36%)" }}>{profile.successCount}</div>
              <div className="text-xs text-muted-foreground">Placed</div>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No session requests yet.</p>
            <p className="text-xs mt-1">Your volunteer requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: CaptainSession) => (
              <div key={session.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-900 text-white text-xs font-bold flex-shrink-0"
                    >
                      {session.requesterInitials ?? session.requesterName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{session.requesterName}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {session.requesterLocation && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {session.requesterLocation}
                          </span>
                        )}
                        {session.requesterDisability && (
                          <span className="text-xs text-muted-foreground">· {session.requesterDisability}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium flex-shrink-0 ${STATUS_COLORS[session.status] ?? ""}`}>
                    {session.status}
                  </span>
                </div>

                {session.message && (
                  <p className="text-xs text-muted-foreground mt-2 ml-12 italic">"{session.message}"</p>
                )}

                <div className="flex gap-2 mt-3 ml-12">
                  {session.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="text-xs h-7 text-white"
                        style={{ background: "hsl(142 76% 36%)" }}
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ sessionId: session.id, status: "accepted" })}
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ sessionId: session.id, status: "declined" })}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                      </Button>
                    </>
                  )}
                  {session.status === "accepted" && (
                    <Button
                      size="sm"
                      className="text-xs h-7 text-white"
                      style={{ background: "hsl(204 100% 36%)" }}
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ sessionId: session.id, status: "completed" })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                    </Button>
                  )}
                  {session.status === "completed" && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Successfully mentored
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CaptainCard({
  captain,
  onRequest,
}: {
  captain: Captain;
  onRequest: (c: Captain) => void;
}) {
  const successRate =
    captain.assignedCount > 0
      ? Math.round((captain.successCount / captain.assignedCount) * 100)
      : 0;

  // Mock expertise tags
  const expertise = [
    { label: "Tech Specialist", icon: GraduationCap, bg: "bg-slate-100", text: "text-slate-800" },
    { label: "Career Coach", icon: Briefcase, bg: "bg-slate-100", text: "text-slate-800" },
    { label: "Advocacy", icon: Heart, bg: "bg-slate-100", text: "text-slate-800" },
  ];

  return (
    <Card className="teb-card-clickable group border-2 border-slate-900 shadow-md overflow-hidden bg-white hover:-translate-y-1 transition-all">
      <CardContent className="p-0">
        <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 relative">
          <div className="absolute -bottom-10 left-6">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-900 shadow-md flex items-center justify-center text-white font-black text-2xl transition-transform group-hover:scale-105"
            >
              {captain.avatarInitials}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none flex items-center gap-1.5 font-bold">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {successRate}% Match Score
            </Badge>
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-slate-900 text-lg leading-none">{captain.displayName}</h3>
            <div className="text-xxs font-black uppercase text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {captain.location}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{captain.bio}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {expertise.map((exp) => (
              <div key={exp.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${exp.bg} ${exp.text} text-xxs font-black uppercase tracking-wider`}>
                <exp.icon className="w-3 h-3" />
                {exp.label}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex flex-col">
              <span className="text-xxs font-black uppercase text-muted-foreground">Total Mentored</span>
              <span className="text-sm font-black text-slate-900">{captain.assignedCount}</span>
            </div>
            <AuthGuard when="signed-in">
              <Button
                size="sm"
                className="bg-slate-900 text-white font-bold rounded-xl px-6 hover:bg-slate-800 transition-all active:scale-95"
                onClick={() => onRequest(captain)}
              >
                Connect <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </AuthGuard>
            <AuthGuard when="signed-out">
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="bg-slate-900 text-white font-bold rounded-xl px-6 hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </SignInButton>
            </AuthGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityCaptains() {
  const { data, isLoading } = useQuery({
    queryKey: ["captains"],
    queryFn: () => api.captains.list(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const [requestingCaptain, setRequestingCaptain] = useState<Captain | null>(null);

  const captains = data?.captains ?? [];

  const isCaptain = myProfile?.role === "captain";

  return (
    <div className="min-h-screen bg-muted">
      {requestingCaptain && (
        <RequestSessionModal
          captain={requestingCaptain}
          onClose={() => setRequestingCaptain(null)}
        />
      )}

      <div className="teb-hero teb-hero-purple py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn direction="up" distance={18}>
            <div className="teb-section-icon mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-white mb-2" style={{ fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}>
              Community Captains
            </h1>
            <p className="text-white/85 text-lg max-w-xl">
              Our {data?.total ?? "—"} volunteer Captains guide PWD members through job search,
              benefits navigation, and community integration.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AuthGuard when="signed-in">
          {isCaptain && <CaptainDashboard />}
        </AuthGuard>

        <div className="mb-10">
          <span className="teb-kicker" style={{ color: "hsl(262 83% 58%)" }}>How It Works</span>
          <h2 className="text-xl font-bold text-foreground mb-2">Step-by-Step</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-xl border border-border p-4"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3"
                  style={{ background: "hsl(262 83% 58%)" }}
                >
                  {step.step}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="teb-kicker" style={{ color: "hsl(262 83% 58%)" }}>Find Your Match</span>
              <h2 className="text-xl font-bold text-foreground">Our Captains</h2>
            </div>
            <span className="text-sm text-muted-foreground">{captains.length} active captains</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border border-border">
                  <CardContent className="p-6 h-48" />
                </Card>
              ))}
            </div>
          ) : captains.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No captains available yet.</p>
              <p className="text-sm mt-1">Be the first to become a Community Captain!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {captains.map((c) => (
                <CaptainCard key={c.id} captain={c} onRequest={setRequestingCaptain} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl p-8 text-center" style={{ background: "hsl(262 60% 95%)" }}>
          <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(262 83% 58%)" }} />
          <h3 className="font-bold text-foreground text-lg mb-1">Become a Community Captain</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Have you overcome barriers as a PWD? Share your experience and guide others. Set your profile role to "Community Captain" to get started.
          </p>
          <AuthGuard when="signed-in">
            <Button
              style={{ background: "hsl(262 83% 58%)" }}
              className="text-white rounded-full px-7"
              onClick={() => (window.location.href = appPath("/dashboard"))}
            >
              Set Up as Captain <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </AuthGuard>
          <AuthGuard when="signed-out">
            <SignInButton mode="modal">
              <Button style={{ background: "hsl(262 83% 58%)" }} className="text-white rounded-full px-7">
                Sign in to Become a Captain <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </SignInButton>
          </AuthGuard>
        </div>
      </div>
    </div>
  );
}
