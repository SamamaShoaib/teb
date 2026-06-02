import { useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
  useUser,
} from "@clerk/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type UserProfile, type UserRole, WITHDRAWAL_REASON_PRESETS, type WithdrawalReasonCode } from "@/lib/api";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { LanguageProvider, useTranslation } from "./lib/i18n";
import { Loader2, Pencil, X, ChevronRight, Sparkles, HelpCircle, Mic, MicOff, BadgeCheck, ShieldCheck, Video, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/motion";
import { AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import TalentHub from "@/pages/TalentHub";
import CorporatePortal from "@/pages/CorporatePortal";
import SupportFunding from "@/pages/SupportFunding";
import { Card, CardContent } from "@/components/ui/card";
import CommunityCaptains from "@/pages/CommunityCaptains";
import ImpactDashboard from "./pages/ImpactDashboard";
import InterviewRoom from "./pages/InterviewRoom";
import AdminGrantApplications from "@/pages/AdminGrantApplications";
import AboutMission from "@/pages/AboutMission";
import ImpactReports from "@/pages/ImpactReports";
import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import VerificationPortal from "@/pages/VerificationPortal";
import GovernmentResources from "@/pages/GovernmentResources";
import LegalAid from "@/pages/LegalAid";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(204, 100%, 36%)",
    colorForeground: "hsl(215, 28%, 17%)",
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorDanger: "hsl(0, 72%, 51%)",
    colorBackground: "#ffffff",
    colorInput: "#f8fafc",
    colorInputForeground: "hsl(215, 28%, 17%)",
    colorNeutral: "hsl(214, 32%, 91%)",
    colorModalBackdrop: "rgba(15, 23, 42, 0.6)",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-[hsl(204,100%,36%)] font-semibold hover:text-[hsl(204,100%,28%)]",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-[hsl(204,100%,36%)]",
    formFieldSuccessText: "text-emerald-600",
    alertText: "text-slate-700",
    logoBox: "mb-2",
    logoImage: "w-10 h-10",
    socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50 bg-white",
    formButtonPrimary: "bg-[hsl(204,100%,36%)] hover:bg-[hsl(204,100%,28%)] text-white font-semibold",
    formFieldInput: "border border-slate-200 bg-slate-50 text-slate-900 rounded-lg focus:ring-2 focus:ring-[hsl(204,100%,36%)]",
    footerAction: "bg-slate-50 border-t border-slate-100",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border border-red-200",
    otpCodeFieldInput: "border border-slate-200 bg-white text-slate-900",
    formFieldRow: "",
    main: "",
  },
};

function useSafeClerk() {
  try {
    return useClerk();
  } catch (e) {
    return null;
  }
}

function useSafeUser() {
  try {
    return useUser();
  } catch (e) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }
}

export function AuthGuard({ children, when }: { children: React.ReactNode, when: "signed-in" | "signed-out" }) {
  const clerk = useSafeClerk();
  const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";
  
  if (MOCK_MODE) {
    if (when === "signed-in") return <>{children}</>;
    return null; // Mock mode is always signed in
  }

  // If Clerk is NOT initialized (missing key), we cannot render anything that uses Clerk components.
  if (!clerk) return null;

  const { isLoaded, isSignedIn } = useSafeUser();
  
  if (!isLoaded) return null;
  if (when === "signed-in" && isSignedIn) return <>{children}</>;
  if (when === "signed-out" && !isSignedIn) return <>{children}</>;
  return null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred in this section."}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              style={{ background: "hsl(204 100% 36%)" }}
              className="text-white w-full"
            >
              Refresh Prototype
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem("teb-tour-completed");
  });

  if (!isVisible) return null;

  const steps = [
    {
      title: "Welcome to the Bridge",
      content: "The Empowerment Bridge (TEB) is Pakistan's first holistic ecosystem for Persons with Disabilities.",
      target: "Hero",
    },
    {
      title: "The Talent Hub",
      content: "Discover jobs from inclusive employers like Jazz, Telenor, and Systems Limited.",
      target: "Jobs",
    },
    {
      title: "Impact & Growth",
      content: "We track every rupee and every job placement to ensure total transparency.",
      target: "Impact",
    }
  ];

  const finish = () => {
    localStorage.setItem("teb-tour-completed", "true");
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="shadow-2xl border-blue-200 overflow-hidden">
        <div className="h-1.5 w-full bg-muted">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Platform Tour</span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{steps[step].title}</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {steps[step].content}
          </p>
          <div className="flex items-center justify-between">
            <button 
              onClick={finish}
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              <Button 
                size="sm" 
                style={{ background: "hsl(204 100% 36%)" }}
                onClick={() => (step === steps.length - 1 ? finish() : setStep(s => s + 1))}
              >
                {step === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[80dvh] items-center justify-center bg-muted px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[80dvh] items-center justify-center bg-muted px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "pwd", label: "Person with Disability (PWD)" },
  { value: "corporate", label: "Employer / HR Professional" },
  { value: "donor", label: "Donor / Supporter" },
  { value: "captain", label: "Community Captain / Volunteer" },
];

function VoiceCommander() {
  const [isListening, setIsListening] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Your browser doesn't support Voice Commands.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);

      if (command.includes("jobs") || command.includes("talent")) {
        setLocation("/talent-hub");
        toast({ title: "Navigating", description: "Opening Talent Hub..." });
      } else if (command.includes("impact") || command.includes("data")) {
        setLocation("/impact");
        toast({ title: "Navigating", description: "Opening Impact Dashboard..." });
      } else if (command.includes("home")) {
        setLocation("/");
        toast({ title: "Navigating", description: "Going Home..." });
      } else {
        toast({ title: "Unknown Command", description: `You said: "${command}". Try "Open Jobs" or "Show Impact".` });
      }
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <Button
        onClick={startListening}
        className={`w-7 h-7 rounded-full shadow-2xl transition-all duration-300 ${
          isListening ? "bg-red-500 scale-110 ring-4 ring-red-100" : "bg-blue-600 hover:scale-105"
        }`}
      >
        {isListening ? <Mic className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
      </Button>
      {isListening && (
        <div className="absolute bottom-16 left-0 bg-white border border-border shadow-xl rounded-xl p-3 w-48 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] font-black uppercase text-red-600 mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Listening...
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            Try: "Open Jobs", "Show Impact", "Go Home"
          </p>
        </div>
      )}
    </div>
  );
}

function MockProfileForm({ profile, onSaved }: { profile: UserProfile | null; onSaved: () => void }) {
  return <ProfileFormContent profile={profile} onSaved={onSaved} user={null} />;
}

function ClerkProfileForm({ profile, onSaved }: { profile: UserProfile | null; onSaved: () => void }) {
  const { user } = useUser();
  return <ProfileFormContent profile={profile} onSaved={onSaved} user={user} />;
}

function ProfileForm({ profile, onSaved }: { profile: UserProfile | null; onSaved: () => void }) {
  const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";
  if (MOCK_MODE) return <MockProfileForm profile={profile} onSaved={onSaved} />;
  return <ClerkProfileForm profile={profile} onSaved={onSaved} />;
}

function ProfileFormContent({
  profile,
  onSaved,
  user,
}: {
  profile: UserProfile | null;
  onSaved: () => void;
  user: unknown;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const defaultName = profile?.displayName ?? [user?.firstName, user?.lastName].filter(Boolean).join(" ") ?? "";

  const [form, setForm] = useState({
    displayName: defaultName,
    role: (profile?.role ?? "pwd") as UserRole,
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    disability: profile?.disability ?? "",
    companyName: profile?.companyName ?? "",
    website: profile?.website ?? "",
    pslVideoUrl: profile?.pslVideoUrl ?? "",
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const handleRecordPSL = async () => {
    setIsRecording(true);
    setRecordingProgress(0);
    
    // Simulate recording & AI captioning
    for (let i = 0; i <= 100; i += 10) {
      setRecordingProgress(i);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setForm(prev => ({ ...prev, pslVideoUrl: "https://teb-storage.mock/intro.mp4" }));
    setIsRecording(false);
    toast({ 
      title: "PSL Intro Recorded", 
      description: "AI has successfully generated captions for your sign language introduction.",
    });
  };

  const mutation = useMutation({
    mutationFn: () =>
      api.users.updateProfile({
        displayName: form.displayName,
        role: form.role,
        bio: form.bio || undefined,
        location: form.location || undefined,
        disability: form.disability || undefined,
        companyName: form.companyName || undefined,
        website: form.website || undefined,
        pslVideoUrl: form.pslVideoUrl || undefined,
      }),
    onSuccess: () => {
      toast({ title: "Profile saved!", description: "Your TEB profile has been updated." });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      onSaved();
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const [isScanning, setIsScanning] = useState(false);
  const handleAIScan = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 1500)); // Simulate AI thinking
    setForm({
      displayName: defaultName || "Ahmed Khan",
      role: "pwd",
      bio: "Self-taught web developer with a passion for building accessible user interfaces. I have been working with React for 2 years and am looking for remote opportunities that support screen readers.",
      location: "Lahore, Pakistan",
      disability: "Visual Impairment",
      companyName: "",
      website: "https://ahmed-dev.github.io",
    });
    setIsScanning(false);
    toast({ 
      title: "AI Scan Complete", 
      description: "We've populated your profile based on your (mock) resume scan!", 
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">AI Profile Builder</p>
            <p className="text-xs text-blue-700">Scan your resume to auto-fill your profile.</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAIScan} 
          disabled={isScanning}
          className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {isScanning ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
          {isScanning ? "Scanning..." : "Quick Scan"}
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Display Name *</label>
        <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="Your full name" />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">I am a...</label>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Location</label>
        <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g., Gulberg, Lahore" />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Tell the community a bit about yourself..."
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {form.role === "pwd" && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Type of Disability</label>
          <Input value={form.disability} onChange={(e) => set("disability", e.target.value)} placeholder="e.g., Visual impairment, Hearing loss, Mobility" />
        </div>
      )}

      {form.role === "pwd" && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-slate-900">Accessibility Studio</p>
            </div>
            {form.pslVideoUrl && (
              <Badge variant="outline" className="text-[10px] uppercase bg-green-50 text-green-700 border-green-200 font-black">
                PSL Intro Saved
              </Badge>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            {isRecording ? (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="w-4 h-4 bg-red-600 rounded-full" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">Analyzing Sign Language...</p>
                  <div className="w-32 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${recordingProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : form.pslVideoUrl ? (
              <div className="py-4 space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-600 px-4">"Hello, I am Ahmed. I am a web developer specializing in accessible React apps..."</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setForm(prev => ({ ...prev, pslVideoUrl: "" }))}
                  className="text-[10px] font-black uppercase tracking-widest h-7"
                >
                  Record New
                </Button>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 bg-slate-50 text-muted-foreground rounded-full flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Record Sign Language (PSL) Intro</p>
                  <p className="text-[10px] text-muted-foreground">60% of employers prioritize candidates with video bios.</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleRecordPSL}
                  style={{ background: "hsl(204 100% 36%)" }}
                  className="text-white text-xs font-bold rounded-lg"
                >
                  Start Recording
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {(form.role === "corporate") && (
        <>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Company Name</label>
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Your organization" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Website</label>
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourcompany.com" />
          </div>
        </>
      )}

      <Button
        disabled={mutation.isPending || !form.displayName.trim()}
        onClick={() => mutation.mutate()}
        style={{ background: "hsl(204 100% 36%)" }}
        className="text-white w-full"
      >
        {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {profile ? "Save Changes" : "Set Up Profile"}
      </Button>
    </div>
  );
}

const GRANT_TYPE_LABELS: Record<string, string> = {
  livelihood_fund: "Livelihood Fund",
  skills_training: "Skills Training",
  assistive_technology: "Assistive Technology",
};

const GRANT_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "#fff8e1", color: "#f57f17", label: "Pending Review" },
  under_review: { bg: "#e8f4fd", color: "#006fba", label: "Under Review" },
  approved: { bg: "#e8f5e9", color: "#2e7d32", label: "Approved" },
  rejected: { bg: "#fce4ec", color: "#c62828", label: "Not Approved" },
  withdrawn: { bg: "#eceff1", color: "#546e7a", label: "Withdrawn" },
};

function GrantApplicationDetailModal({ applicationId, onClose }: { applicationId: number; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myGrantApplication", applicationId],
    queryFn: () => api.grantApplications.mineGet(applicationId),
    staleTime: 30_000,
  });

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-detail-title"
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-6 border-b border-border sticky top-0 bg-white rounded-t-2xl">
          <div className="min-w-0">
            <h2 id="grant-detail-title" className="text-lg font-bold text-foreground">
              Grant Application Details
            </h2>
            {data && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{data.referenceNumber}</p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 teb-focus-ring"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading application details...
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive py-2">
              {error instanceof Error ? error.message : "Unable to load application details."}
            </p>
          )}
          {data && (
            <div className="space-y-6 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: GRANT_STATUS_STYLES[data.status]?.bg ?? "#eee",
                    color: GRANT_STATUS_STYLES[data.status]?.color ?? "#333",
                  }}
                >
                  {GRANT_STATUS_STYLES[data.status]?.label ?? data.status}
                </span>
                <span className="text-foreground font-semibold">
                  {GRANT_TYPE_LABELS[data.grantType] ?? data.grantType}
                </span>
                <span className="text-muted-foreground">
                  &middot; Rs {data.requestedAmountPkr.toLocaleString()} requested
                </span>
              </div>

              <DetailSection title="Applicant Information">
                <DetailField label="Full name" value={data.fullName} />
                <DetailField label="Email" value={data.email} />
                <DetailField label="Phone" value={data.phone} />
                <DetailField label="Date of birth" value={data.dateOfBirth} />
                <DetailField label="Address" value={data.address} fullWidth />
              </DetailSection>

              <DetailSection title="Disability Verification">
                <DetailField label="Disability type" value={data.disabilityType} />
                <DetailField label="Certificate number" value={data.disabilityCertificateNumber} />
                <DetailField label="Certifying physician" value={data.certifyingPhysician} fullWidth />
              </DetailSection>

              <DetailSection title="Use of Funds">
                <DetailField label="How funds will be used" value={data.useCase} fullWidth />
                {data.additionalNotes && (
                  <DetailField label="Additional notes" value={data.additionalNotes} fullWidth />
                )}
              </DetailSection>

              <DetailSection title="Timeline">
                <DetailField
                  label="Submitted"
                  value={new Date(data.createdAt).toLocaleString("en-PK", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                />
                <DetailField
                  label="Last updated"
                  value={new Date(data.updatedAt).toLocaleString("en-PK", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                />
              </DetailSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="teb-kicker" style={{ marginBottom: 6 }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-2">{children}</div>
    </div>
  );
}

function DetailField({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">{label}</div>
      <div className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</div>
    </div>
  );
}

function WithdrawConfirmDialog({
  app,
  onCancel,
  onConfirm,
  isPending,
}: {
  app: { id: number; referenceNumber: string };
  onCancel: () => void;
  onConfirm: (withdrawalReason?: string) => void;
  isPending: boolean;
}) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [reasonCode, setReasonCode] = useState<WithdrawalReasonCode | "">("");
  const [otherReason, setOtherReason] = useState("");

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    cancelBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onCancel, isPending]);

  const handleConfirm = () => {
    if (!reasonCode) {
      onConfirm(undefined);
      return;
    }
    if (reasonCode === "other") {
      const trimmed = otherReason.trim();
      onConfirm(trimmed.length > 0 ? trimmed : "other");
      return;
    }
    onConfirm(reasonCode);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={() => !isPending && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
      aria-describedby="withdraw-desc"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="withdraw-title" className="text-lg font-bold text-foreground">
          Withdraw this application?
        </h2>
        <p id="withdraw-desc" className="text-sm text-muted-foreground mt-2">
          You're about to withdraw application{" "}
          <span className="font-mono font-semibold text-foreground">{app.referenceNumber}</span>. This
          action cannot be undone. You can submit a new application later if needed.
        </p>

        <div className="mt-4 space-y-2">
          <label htmlFor="withdraw-reason" className="text-sm font-medium text-foreground">
            Why are you withdrawing? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            id="withdraw-reason"
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value as WithdrawalReasonCode | "")}
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm teb-focus-ring disabled:opacity-60"
          >
            <option value="">Prefer not to say</option>
            {WITHDRAWAL_REASON_PRESETS.map((p) => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
          {reasonCode === "other" && (
            <textarea
              aria-label="Tell us more (optional)"
              placeholder="Tell us more (optional)"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value.slice(0, 1000))}
              disabled={isPending}
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm teb-focus-ring disabled:opacity-60 resize-y"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Your feedback helps us improve the program. This is optional.
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-full px-5 py-2 text-sm font-semibold border border-border bg-white hover:bg-muted teb-focus-ring disabled:opacity-60"
          >
            Keep application
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white teb-focus-ring inline-flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#c62828" }}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Withdrawing..." : "Yes, withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyGrantApplications({ userId }: { userId: number }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<{ id: number; referenceNumber: string } | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myGrantApplications", userId],
    queryFn: api.grantApplications.mine,
    staleTime: 30_000,
  });

  const withdrawMutation = useMutation({
    mutationFn: (vars: { id: number; withdrawalReason?: string }) =>
      api.grantApplications.withdraw(vars.id, vars.withdrawalReason),
    onSuccess: () => {
      toast({ title: "Application withdrawn", description: "Your grant application has been withdrawn successfully." });
      setWithdrawTarget(null);
      qc.invalidateQueries({ queryKey: ["myGrantApplications", userId] });
    },
    onError: (err) => {
      toast({
        title: "Could not withdraw application",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your applications...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive py-2">Unable to load your applications. Please try again later.</p>
    );
  }

  const apps = data?.applications ?? [];

  if (apps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        You have not submitted any grant applications yet. Visit{" "}
        <a href={`${basePath}/support-funding`} className="underline font-medium" style={{ color: "hsl(204 100% 36%)" }}>
          Support &amp; Funding
        </a>{" "}
        to apply.
      </p>
    );
  }

  const activeApps = apps.filter((a) => a.status !== "withdrawn");
  const withdrawnApps = apps.filter((a) => a.status === "withdrawn");

  const renderRow = (app: typeof apps[number]) => {
    const style = GRANT_STATUS_STYLES[app.status] ?? GRANT_STATUS_STYLES.pending;
    const isWithdrawn = app.status === "withdrawn";
    const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpenId(app.id);
      }
    };
    return (
      <div
        key={app.id}
        role="button"
        tabIndex={0}
        onClick={() => setOpenId(app.id)}
        onKeyDown={onKey}
        aria-label={`View details for application ${app.referenceNumber}`}
        className={`w-full text-left rounded-xl border border-border p-4 ${isWithdrawn ? "bg-muted/40 opacity-90" : "bg-muted/30"} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-primary/40 hover:bg-muted/50 transition-colors teb-focus-ring cursor-pointer`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-muted-foreground">{app.referenceNumber}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: style.bg, color: style.color }}
            >
              {style.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mt-1">
            {GRANT_TYPE_LABELS[app.grantType] ?? app.grantType}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Requested: Rs {app.requestedAmountPkr.toLocaleString()} &middot; Applied{" "}
            {new Date(app.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
            {isWithdrawn && app.withdrawnAt && (
              <>
                {" "}&middot; Withdrawn{" "}
                {new Date(app.withdrawnAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {app.status === "under_review" && (
            <span className="text-xs text-muted-foreground hidden sm:inline">A captain is reviewing your application.</span>
          )}
          {app.status === "pending" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setWithdrawTarget({ id: app.id, referenceNumber: app.referenceNumber });
              }}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label={`Withdraw application ${app.referenceNumber}`}
              className="text-xs font-semibold rounded-full px-3 py-1 border border-border hover:bg-white hover:border-destructive/40 hover:text-destructive transition-colors teb-focus-ring"
            >
              Withdraw
            </button>
          )}
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "hsl(204 100% 36%)" }}>
            View Details <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {openId !== null && (
        <GrantApplicationDetailModal applicationId={openId} onClose={() => setOpenId(null)} />
      )}
      {withdrawTarget && (
        <WithdrawConfirmDialog
          app={withdrawTarget}
          isPending={withdrawMutation.isPending}
          onCancel={() => {
            if (!withdrawMutation.isPending) setWithdrawTarget(null);
          }}
          onConfirm={(withdrawalReason) =>
            withdrawMutation.mutate({ id: withdrawTarget.id, withdrawalReason })
          }
        />
      )}
      {activeApps.length > 0 && (
        <div className="space-y-3">
          {activeApps.map((app) => renderRow(app))}
        </div>
      )}
      {activeApps.length === 0 && withdrawnApps.length > 0 && (
        <p className="text-sm text-muted-foreground py-2">
          You have no active grant applications. Visit{" "}
          <a href={`${basePath}/support-funding`} className="underline font-medium" style={{ color: "hsl(204 100% 36%)" }}>
            Support &amp; Funding
          </a>{" "}
          to apply again.
        </p>
      )}
      {withdrawnApps.length > 0 && (
        <details className="mt-4 rounded-xl border border-border bg-muted/20 group">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground flex items-center justify-between teb-focus-ring rounded-xl select-none list-none">
            <span>
              Withdrawn applications{" "}
              <span className="text-muted-foreground font-normal">({withdrawnApps.length})</span>
            </span>
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="px-4 pb-4 pt-1 space-y-3">
            {withdrawnApps.map((app) => renderRow(app))}
          </div>
        </details>
      )}
    </>
  );
}

interface DashboardLayoutProps {
  user: any;
  profile: UserProfile | null;
  profileLoading: boolean;
  editingProfile: boolean;
  setEditingProfile: (val: boolean) => void;
  onSaved: () => void;
}

function DashboardLayout({ user, profile, profileLoading, editingProfile, setEditingProfile, onSaved }: DashboardLayoutProps) {
  const pillars = [
    { label: "Talent Hub", href: `${basePath}/talent-hub`, desc: "Find inclusive job opportunities." },
    { label: "Corporate Portal", href: `${basePath}/corporate-portal`, desc: "Partner with us to hire inclusively." },
    { label: "Support & Funding", href: `${basePath}/support-funding`, desc: "Access grants and resources." },
    { label: "Community Captains", href: `${basePath}/community-captains`, desc: "Lead and empower your community." },
  ];
  const ecosystem = [
    { label: "Verify Identity", href: `${basePath}/verify-identity`, desc: "Sync with NADRA PWD database." },
    { label: "Government Benefits", href: `${basePath}/government-benefits`, desc: "Access BISP & HEC support." },
    { label: "Legal Aid & Rights", href: `${basePath}/legal-aid`, desc: "Your rights under CPLDA 2020." },
  ];
  const isCaptain = profile?.role === "captain";
  const isPwd = profile?.role === "pwd";
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, {user?.firstName ?? profile?.displayName ?? "Friend"}!
        </h1>
        <p className="text-muted-foreground text-sm">Your Empowerment Bridge dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Your Profile</h2>
            {profile && !editingProfile && (
              <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1 text-sm font-medium" style={{ color: "hsl(204 100% 36%)" }}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
          {profileLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading profile...
            </div>
          ) : profile && !editingProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: "hsl(204 100% 36%)" }}>
                  {profile.avatarInitials ?? profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{profile.displayName}</p>
                    {profile.isVerified && (
                      <div className="flex items-center gap-0.5 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{ROLE_OPTIONS.find((r) => r.value === profile.role)?.label ?? profile.role}</p>
                </div>
              </div>
              {profile.location && <p className="text-sm text-muted-foreground">📍 {profile.location}</p>}
              {profile.bio && <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{profile.bio}</p>}
              
              {isPwd && !profile.isVerified && (
                <a 
                  href={`${basePath}/verify-identity`}
                  className="mt-4 block p-3 bg-blue-50 border border-blue-100 rounded-xl group hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <p className="text-xs font-bold text-blue-900">Get Verified Status</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )}
            </div>
          ) : (
            <div>
              <ProfileForm profile={profile ?? null} onSaved={onSaved} />
              {editingProfile && (
                <button onClick={() => setEditingProfile(false)} className="mt-3 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-4">Core Services</h2>
            <div className="grid grid-cols-1 gap-3">
              {pillars.map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-border p-4 hover:bg-muted transition-colors group">
                  <div className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: "hsl(204 100% 36%)" }}>{item.label}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4">Empowerment Ecosystem</h2>
            <div className="grid grid-cols-1 gap-3">
              {ecosystem.map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors group">
                  <div className="font-semibold text-sm mb-1 text-blue-400 group-hover:underline">{item.label}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-4">Explore TEB</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pillars.map((item) => (
            <a key={item.href} href={item.href} className="rounded-xl border border-border p-4 hover:bg-muted transition-colors group">
              <div className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: "hsl(204 100% 36%)" }}>{item.label}</div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
      {profile?.role === "pwd" && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-1">My Grant Applications</h2>
          <p className="text-sm text-muted-foreground mb-4">Track the status of grants you have applied for.</p>
          <MyGrantApplications userId={profile.id} />
        </div>
      )}
      {isCaptain && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-1">Admin Tools</h2>
          <p className="text-sm text-muted-foreground mb-4">Manage submissions and community activities.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href={`${basePath}/admin/grant-applications`} className="rounded-xl border border-border p-4 hover:bg-muted transition-colors group">
              <div className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: "hsl(204 100% 36%)" }}>Grant Management</div>
              <p className="text-xs text-muted-foreground">Review and update grant application statuses.</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function MockDashboard() {
  const qc = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });
  return <DashboardLayout user={null} profile={profile ?? null} profileLoading={profileLoading} editingProfile={editingProfile} setEditingProfile={setEditingProfile} onSaved={() => { setEditingProfile(false); qc.invalidateQueries({ queryKey: ["myProfile"] }); }} />;
}

function ClerkDashboard() {
  const { user } = useUser();
  const qc = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });
  return <DashboardLayout user={user} profile={profile ?? null} profileLoading={profileLoading} editingProfile={editingProfile} setEditingProfile={setEditingProfile} onSaved={() => { setEditingProfile(false); qc.invalidateQueries({ queryKey: ["myProfile"] }); }} />;
}

function DashboardPage() {
  const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";
  if (MOCK_MODE) return <MockDashboard />;
  return <ClerkDashboard />;
}

function ClerkQueryClientCacheInvalidator() {
  const clerk = useSafeClerk();
  if (!clerk) return null;
  const { addListener } = clerk;
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [clerk, qc]); // Added clerk to deps

  return null;
}

function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let rafId = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const scaleX = total > 0 ? h.scrollTop / total : 0;
      if (ref.current) {
        ref.current.style.transform = `scaleX(${scaleX})`;
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        rafId = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="teb-scroll-progress"
      style={{ width: "100%", transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollProgress />
      <NavBar />
      <OnboardingTour />
      <VoiceCommander />
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location} routeKey={location}>
            <Switch location={location}>
              <Route path="/">
                <Home />
              </Route>
              <Route path="/dashboard">
                <>
                  <AuthGuard when="signed-in">
                    <DashboardPage />
                  </AuthGuard>
                  <AuthGuard when="signed-out">
                    <Redirect to="/" />
                  </AuthGuard>
                </>
              </Route>
              <Route path="/talent-hub" component={TalentHub} />
              <Route path="/corporate-portal" component={CorporatePortal} />
              <Route path="/support-funding" component={SupportFunding} />
              <Route path="/verify-identity" component={VerificationPortal} />
              <Route path="/government-benefits" component={GovernmentResources} />
              <Route path="/legal-aid" component={LegalAid} />
              <Route path="/community-captains" component={CommunityCaptains} />
              <Route path="/impact" component={ImpactDashboard} />
              <Route path="/interview" component={InterviewRoom} />
              <Route path="/admin/grant-applications">
                <>
                  <AuthGuard when="signed-in">
                    <AdminGrantApplications />
                  </AuthGuard>
                  <AuthGuard when="signed-out">
                    <Redirect to="/" />
                  </AuthGuard>
                </>
              </Route>
              <Route path="/about/mission" component={AboutMission} />
              <Route path="/about/impact" component={ImpactReports} />
              <Route path="/about/contact" component={ContactUs} />
              <Route path="/about/privacy" component={PrivacyPolicy} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route component={NotFound} />
            </Switch>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const isRealKey = clerkPubKey && !clerkPubKey.includes("your_key_here");

  const content = (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Router />
    </ErrorBoundary>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isRealKey ? (
          <ClerkProvider
            publishableKey={clerkPubKey}
            {...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {})}
            appearance={clerkAppearance}
            signInUrl={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            signInFallbackRedirectUrl={`${basePath}/dashboard`}
            signUpFallbackRedirectUrl={`${basePath}/dashboard`}
            afterSignOutUrl={`${basePath}/`}
            localization={{
              signIn: {
                start: {
                  title: "Welcome back",
                  subtitle: "Sign in to access The Empowerment Bridge",
                },
              },
              signUp: {
                start: {
                  title: "Join TEB",
                  subtitle: "Create your account to get started",
                },
              },
            }}
            routerPush={(to) => setLocation(stripBase(to))}
            routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
          >
            <ClerkQueryClientCacheInvalidator />
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </LanguageProvider>
  );
}

export default App;
