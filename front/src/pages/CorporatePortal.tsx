import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, CheckCircle2, Users, Trophy, ArrowRight, Handshake,
  X, Loader2, Search, MapPin, Briefcase, AlertCircle, TrendingUp, BarChart, Clock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SignInButton } from "@clerk/react";
import { AuthGuard } from "@/App";
import { api, type Stats, type UserProfile } from "@/lib/api";
import { appPath } from "@/lib/basePath";
import { FadeIn } from "@/components/motion";

const benefits = [
  {
    icon: Users,
    title: "Access Skilled Talent",
    description: "Tap into a diverse pool of motivated, skilled PWD candidates pre-screened for your roles.",
  },
  {
    icon: CheckCircle2,
    title: "Accommodation Guidance",
    description: "Our team helps you design accessible workplaces and provides accommodation implementation guides.",
  },
  {
    icon: Trophy,
    title: "Recognised Impact",
    description: "Showcase your inclusive hiring on your TEB partner profile and in our annual community impact report.",
  },
  {
    icon: Handshake,
    title: "Ongoing Support",
    description: "Volunteer account guides, job coaching resources, and PWD workplace integration training — all free.",
  },
];

const partnerTiers = [
  {
    name: "Ally Partner",
    price: "Always Free",
    color: "hsl(214 20% 60%)",
    features: [
      "Post up to 2 job listings per month",
      "Access to candidate profiles",
      "Basic accommodation guide",
      "Partner badge on job listings",
    ],
    cta: "Join as Ally",
    featured: false,
  },
  {
    name: "Champion Partner",
    price: "Always Free",
    color: "hsl(204 100% 36%)",
    features: [
      "Unlimited job listings",
      "Priority candidate matching",
      "Volunteer account guide",
      "Workplace inclusion training",
      "Featured company profile",
      "Impact reports & analytics",
    ],
    cta: "Become a Champion",
    featured: true,
  },
  {
    name: "Ambassador Partner",
    price: "Always Free",
    color: "hsl(43 100% 42%)",
    features: [
      "Everything in Champion",
      "Co-led recruitment campaigns",
      "CEO-level impact storytelling",
      "National press recognition",
      "Annual Empowerment Award eligibility",
    ],
    cta: "Lead the Movement",
    featured: false,
  },
];

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

function PostJobModal({
  onClose,
  userProfile,
}: {
  onClose: () => void;
  userProfile: UserProfile | null;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "full_time",
    location: "Lahore",
    remote: false,
    salaryMin: "",
    salaryMax: "",
    skills: "",
    accommodations: "",
  });

  const isCorporate = userProfile?.role === "corporate";

  const mutation = useMutation({
    mutationFn: () =>
      api.jobs.create({
        title: form.title,
        description: form.description,
        type: form.type,
        location: form.location || undefined,
        remote: form.remote,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        accommodations: form.accommodations || undefined,
      }),
    onSuccess: () => {
      toast({ title: "Job posted!", description: `"${form.title}" is now live on TEB's Talent Hub.` });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to post job", description: err.message, variant: "destructive" });
    },
  });

  const set = (key: string, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const isValid = form.title.trim() && form.description.trim() && isCorporate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 my-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Post a Job Listing</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCorporate && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Employer account required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Only corporate / employer accounts can post jobs. Go to your{" "}
                <a href={appPath("/dashboard")} className="underline font-medium">
                  Profile Settings
                </a>{" "}
                and change your role to <strong>Employer / HR Professional</strong>, then come back to post.
              </p>
            </div>
          </div>
        )}

        <div className={`space-y-4 ${!isCorporate ? "opacity-50 pointer-events-none" : ""}`}>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Job Title *</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g., Customer Service Representative"
              disabled={!isCorporate}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Job Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              disabled={!isCorporate}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Job Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                disabled={!isCorporate}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Location</label>
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g., Lahore"
                disabled={!isCorporate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Min Salary (Rs)</label>
              <Input
                type="number"
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="e.g., 18000"
                disabled={!isCorporate}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Max Salary (Rs)</label>
              <Input
                type="number"
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="e.g., 25000"
                disabled={!isCorporate}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Required Skills</label>
            <Input
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="Comma-separated: Communication, MS Office, Data Entry"
              disabled={!isCorporate}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Workplace Accommodations</label>
            <Input
              value={form.accommodations}
              onChange={(e) => set("accommodations", e.target.value)}
              placeholder="e.g., Wheelchair accessible office, flexible hours"
              disabled={!isCorporate}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => set("remote", e.target.checked)}
              className="rounded"
              disabled={!isCorporate}
            />
            <span className="font-medium text-foreground">Remote work available</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          {isCorporate ? (
            <Button
              size="sm"
              disabled={mutation.isPending || !isValid}
              onClick={() => mutation.mutate()}
              style={{ background: "hsl(142 76% 36%)" }}
              className="text-white"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Post Job
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onClose}
              style={{ background: "hsl(204 100% 36%)" }}
              className="text-white"
            >
              Go to Profile Settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ user }: { user: UserProfile }) {
  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "hsl(204 100% 36%)" }}
          >
            {user.avatarInitials ?? user.displayName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{user.displayName}</p>
            {user.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {user.location}
              </p>
            )}
          </div>
          {user.kycVerified && (
            <Badge variant="secondary" className="text-xs text-green-700 bg-green-50">Verified</Badge>
          )}
        </div>

        {user.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{user.bio}</p>
        )}

        <div className="space-y-1.5">
          {user.disability && (
            <p className="text-xs text-muted-foreground">Disability: <span className="text-foreground">{user.disability}</span></p>
          )}
          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.skills.slice(0, 4).map((s) => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          className="w-full mt-3 text-xs text-white"
          style={{ background: "hsl(204 100% 36%)" }}
          onClick={() => window.location.href = appPath("/talent-hub")}
        >
          <Briefcase className="w-3.5 h-3.5 mr-1.5" /> View Jobs They Qualify For
        </Button>
      </CardContent>
    </Card>
  );
}

function AuditTool() {
  const [scores, setScores] = useState<Record<string, boolean>>({});
  const categories = [
    {
      id: "infra",
      label: "Physical Infrastructure",
      items: [
        { id: "ramp", label: "Wheelchair ramps at all entrances", weight: 10 },
        { id: "washroom", label: "Accessible washrooms on every floor", weight: 10 },
        { id: "elevator", label: "Elevators with braille & audio", weight: 5 },
        { id: "tactile", label: "Tactile paving for navigation", weight: 5 },
      ]
    },
    {
      id: "digital",
      label: "Digital Accessibility",
      items: [
        { id: "website", label: "Company website is WCAG 2.1 compliant", weight: 10 },
        { id: "docs", label: "Internal training docs are screen-reader friendly", weight: 10 },
        { id: "meetings", label: "Video meetings support live captioning", weight: 5 },
      ]
    },
    {
      id: "policy",
      label: "HR & Policy",
      items: [
        { id: "quota", label: "3% PWD employment quota achieved", weight: 15 },
        { id: "sensitize", label: "Annual sensitization training for all staff", weight: 15 },
        { id: "remote", label: "Flexible WFH policy for accessibility", weight: 10 },
        { id: "hr", label: "PWD-inclusive recruitment policy", weight: 5 },
      ]
    }
  ];

  const totalPossible = 100;
  const currentScore = categories.reduce((acc, cat) => {
    return acc + cat.items.reduce((cAcc, item) => scores[item.id] ? cAcc + item.weight : cAcc, 0);
  }, 0);

  const toggle = (id: string) => setScores(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Compliance Audit</h2>
            <p className="text-muted-foreground text-sm max-w-md">Assess your organization against Pakistani disability laws and global inclusion standards.</p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-black text-green-400 mb-1">{currentScore}<span className="text-xl text-muted-foreground">/100</span></div>
            <p className="text-xxs font-black uppercase tracking-widest text-muted-foreground">Inclusion Compliance Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="border border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {cat.label}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      checked={!!scores[item.id]}
                      onChange={() => toggle(item.id)}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</p>
                      <span className="text-xxs font-black text-muted-foreground">+{item.weight} pts</span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Actionable Report Available</h4>
            <p className="text-xs text-amber-700">Get a detailed roadmap to reach 100% compliance.</p>
          </div>
        </div>
        <Button 
          disabled={currentScore === 0}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
        >
          Generate Compliance Roadmap
        </Button>
      </div>
    </div>
  );
}

type Tab = "impact-suite" | "audit" | "find-talent" | "post-jobs" | "partner";

function ImpactSuite() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Inclusion Score", value: "84/100", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Active Postings", value: "12", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Total Applications", value: "156", icon: Users, color: "text-green-500", bg: "bg-green-50" },
          { label: "Avg. Time to Hire", value: "18 Days", icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xxs font-black uppercase text-muted-foreground tracking-widest">{kpi.label}</p>
                <p className="text-xl font-black text-slate-900">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Funnel */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Recruitment Funnel</span>
            </div>
            <Badge variant="outline" className="text-white/40 border-white/10 text-xxs">Real-time Updates</Badge>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              {[
                { label: "Applied", count: 156, color: "bg-blue-500", width: "100%" },
                { label: "Screened", count: 89, color: "bg-indigo-500", width: "65%" },
                { label: "Interviewed", count: 42, color: "bg-purple-500", width: "40%" },
                { label: "Hired", count: 12, color: "bg-green-500", width: "15%" },
              ].map((stage) => (
                <div key={stage.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">{stage.label}</span>
                    <span className="text-slate-900">{stage.count} Candidates</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all duration-1000 ease-out`} 
                      style={{ width: stage.width }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border-none shadow-sm">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Recent Activity</h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {[
                { name: "Ahmed K.", action: "Applied to Frontend Developer", time: "2m ago" },
                { name: "Sara M.", action: "Passed Technical Screening", time: "1h ago" },
                { name: "Zahid A.", action: "Interview scheduled", time: "3h ago" },
                { name: "Saira B.", action: "Updated profile skills", time: "5h ago" },
              ].map((act, i) => (
                <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xxs font-bold text-muted-foreground uppercase">
                    {act.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.name}</p>
                    <p className="text-xxs text-muted-foreground truncate">{act.action}</p>
                  </div>
                  <span className="text-xxs text-muted-foreground whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CorporatePortal() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: api.stats.get,
  });
  const [showPostJob, setShowPostJob] = useState(false);
  const search = useSearch();
  const initialTab: Tab = (() => {
    const t = new URLSearchParams(search).get("tab");
    return t === "impact-suite" || t === "post-jobs" || t === "partner" || t === "find-talent" ? t : "impact-suite";
  })();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  useEffect(() => {
    const t = new URLSearchParams(search).get("tab");
    if (t === "impact-suite" || t === "post-jobs" || t === "partner" || t === "find-talent") {
      setActiveTab(t);
    }
  }, [search]);
  const [talentSearch, setTalentSearch] = useState("");

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const { data: talentData, isLoading: talentLoading } = useQuery({
    queryKey: ["talent-pool"],
    queryFn: () => api.users.list({ role: "pwd", limit: 50 }),
  });

  const candidates = (talentData?.users ?? []).filter((u) =>
    talentSearch
      ? u.displayName.toLowerCase().includes(talentSearch.toLowerCase()) ||
        (u.location?.toLowerCase().includes(talentSearch.toLowerCase()) ?? false) ||
        (u.skills?.some((s) => s.toLowerCase().includes(talentSearch.toLowerCase())) ?? false)
      : true
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "impact-suite", label: "Impact Suite" },
    { id: "audit", label: "Audit & Compliance" },
    { id: "find-talent", label: "Talent CRM" },
    { id: "post-jobs", label: "Manage Postings" },
    { id: "partner", label: "Partnership" },
  ];

  return (
    <div className="min-h-screen">
      {showPostJob && (
        <PostJobModal
          onClose={() => setShowPostJob(false)}
          userProfile={myProfile ?? null}
        />
      )}

      <div className="teb-hero teb-hero-green py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn direction="up" distance={18}>
            <div className="teb-section-icon mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-white mb-2" style={{ fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}>
              Corporate Portal
            </h1>
            <p className="text-white/85 text-lg max-w-xl">
              Build an inclusive workforce by connecting with skilled PWD talent. Join{" "}
              {stats?.totalCorporatePartners ?? "—"} partner organizations leading change.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-border flex gap-0 mt-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "impact-suite" && (
        <section className="py-10 bg-slate-50 min-h-[500px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ImpactSuite />
          </div>
        </section>
      )}

      {activeTab === "audit" && (
        <section className="py-10 bg-slate-50 min-h-[500px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AuditTool />
          </div>
        </section>
      )}

      {activeTab === "find-talent" && (
        <section className="py-10 bg-muted min-h-[500px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">PWD Talent Pool</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {talentData?.total ?? "—"} skilled candidates available for inclusive employment
                </p>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, location, skill..."
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
            </div>

            {talentLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse border border-border">
                    <CardContent className="p-5 h-36" />
                  </Card>
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No candidates match your search.</p>
                <p className="text-sm mt-1">Try different keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {candidates.map((u) => (
                  <CandidateCard key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "post-jobs" && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="teb-kicker">Why Partner</span>
              <h2 className="text-2xl font-bold text-foreground mb-2">Why Partner With TEB?</h2>
              <p className="text-muted-foreground">Go beyond CSR — create real inclusive impact while building a stronger business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <Card key={b.title} className="border border-border">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "hsl(142 76% 90%)" }}>
                        <Icon className="w-5 h-5" style={{ color: "hsl(142 76% 36%)" }} />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground mb-1">{b.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="text-center">
              <AuthGuard when="signed-in">
                <Button
                  size="sm"
                  style={{ background: "hsl(142 76% 36%)" }}
                  className="text-white"
                  onClick={() => setShowPostJob(true)}
                >
                  Post Job Now →
                </Button>
              </AuthGuard>
              <AuthGuard when="signed-out">
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline">
                    Sign in to Post
                  </Button>
                </SignInButton>
              </AuthGuard>
            </div>
          </div>
        </section>
      )}

      {activeTab === "partner" && (
        <section className="bg-muted py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="teb-kicker">Engagement Levels</span>
              <h2 className="text-2xl font-bold text-foreground mb-2">Partnership Tiers</h2>
              <p className="text-muted-foreground">Choose the level of commitment that fits your organization.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {partnerTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`border-2 ${tier.featured ? "shadow-xl scale-105" : "border-border"}`}
                  style={{ borderColor: tier.featured ? tier.color : undefined }}
                >
                  <CardContent className="p-6">
                    {tier.featured && (
                      <Badge className="mb-3 text-xs text-white" style={{ background: tier.color }}>Most Popular</Badge>
                    )}
                    <h3 className="font-bold text-lg text-foreground mb-4">{tier.name}</h3>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <AuthGuard when="signed-in">
                      <Button
                        size="sm"
                        style={{ background: "hsl(142 76% 36%)" }}
                        className="text-white w-full sm:w-auto"
                        onClick={() => setShowPostJob(true)}
                      >
                        Post an Opening
                      </Button>
                    </AuthGuard>
                    <AuthGuard when="signed-out">
                      <SignInButton mode="modal">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Sign in to Post
                        </Button>
                      </SignInButton>
                    </AuthGuard>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
