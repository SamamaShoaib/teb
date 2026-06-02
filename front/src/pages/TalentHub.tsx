import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, Briefcase, Wifi, Filter, ChevronRight, Clock, X, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SignInButton } from "@clerk/react";
import { AuthGuard } from "@/App";
import { api, type Job } from "@/lib/api";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { appPath } from "@/lib/basePath";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

function typeLabel(t: string) {
  return JOB_TYPES.find((j) => j.value === t)?.label ?? t;
}

function ApplyModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.jobs.apply(job.id, { coverLetter: coverLetter || undefined }),
    onSuccess: () => {
      toast({ title: "Application submitted!", description: `Your application for "${job.title}" at ${job.companyName} has been sent.` });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Application failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{job.title}</h2>
            <p className="text-sm text-muted-foreground">{job.companyName} · {job.location}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Cover Letter <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit for this role..."
              rows={5}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              style={{ background: "hsl(204 100% 36%)" }}
              className="text-white"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateMatchScore(user: UserProfile | null, job: Job) {
  if (!user) return null;
  
  let score = 0;
  const reasons: string[] = [];

  // 1. Skills Match (50%)
  const userSkills = user.skills || [];
  const matchedSkills = job.skills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
  const skillRatio = job.skills.length > 0 ? matchedSkills.length / job.skills.length : 1;
  score += skillRatio * 50;
  if (matchedSkills.length > 0) reasons.push(`${matchedSkills.length} key skills match`);

  // 2. Accommodation Match (30%)
  const userDisability = (user.disability || "").toLowerCase();
  const jobAcc = (job.accommodations || "").toLowerCase();
  
  let accMatch = false;
  if (job.remote) {
    accMatch = true;
    reasons.push("Remote work supports your accessibility needs");
  } else if (userDisability.includes("visual") && jobAcc.includes("screen reader")) {
    accMatch = true;
    reasons.push("Employer provides screen reader support");
  } else if (userDisability.includes("mobility") && jobAcc.includes("wheelchair")) {
    accMatch = true;
    reasons.push("Office is wheelchair accessible");
  } else if (userDisability.includes("hearing") && jobAcc.includes("sign language")) {
    accMatch = true;
    reasons.push("Sign language support available");
  }

  if (accMatch) score += 30;

  // 3. Trust Bonus (20%)
  if (user.isVerified) {
    score += 20;
    reasons.push("Verified status increases employer trust");
  }

  return { score: Math.round(score), reasons: reasons.slice(0, 2) };
}

function JobCard({ job, onApply, user }: { job: Job; onApply: (job: Job) => void; user: UserProfile | null }) {
  const [expanded, setExpanded] = useState(false);
  const match = calculateMatchScore(user, job);

  return (
    <Card className="border-2 border-slate-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden group bg-white">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex flex-wrap items-start gap-3 justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">{job.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{job.companyName}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                {job.remote && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Wifi className="w-3 h-3" /> Remote
                  </span>
                )}
              </div>
            </div>
            
            {match && (
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border-2 border-slate-900 min-w-[70px]">
                <span className="text-xxs font-black text-white/60 uppercase leading-none mb-1">Match</span>
                <span className="text-xl font-black text-white leading-none">{match.score}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xxs uppercase font-bold tracking-wider">{typeLabel(job.type)}</Badge>
            {job.salaryMin && (
              <Badge variant="outline" className="text-xxs uppercase font-bold tracking-wider">
                Rs {job.salaryMin.toLocaleString()}–{job.salaryMax?.toLocaleString()}
              </Badge>
            )}
          </div>

          <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {job.description}
          </p>

          {match && match.reasons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {match.reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xxs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  <Sparkles className="w-3 h-3 text-slate-500" /> {r}
                </div>
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="h-px bg-border" />
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> Required Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Accommodations Provided
                </p>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border/50">{job.accommodations}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Analyze Fit"}
              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
            <div>
              <AuthGuard when="signed-in">
                <Button
                  size="sm"
                  className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg px-4 transition-all active:scale-95 shadow-sm"
                  onClick={() => onApply(job)}
                >
                  Apply Now
                </Button>
              </AuthGuard>
              <AuthGuard when="signed-out">
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg px-4 transition-all active:scale-95 shadow-sm"
                  >
                    Sign in to Apply
                  </Button>
                </SignInButton>
              </AuthGuard>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TalentHub() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", type, remoteOnly],
    queryFn: () => api.jobs.list({ type: type || undefined, remote: remoteOnly || undefined }),
  });

  const { data: profileData } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });

  const jobs = (data?.jobs ?? []).filter((j) =>
    search
      ? j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.companyName.toLowerCase().includes(search.toLowerCase()) ||
        j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  return (
    <div className="min-h-screen bg-muted">
      {applyingJob && (
        <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} />
      )}

      <div className="teb-hero teb-hero-blue py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn direction="up" distance={18}>
            <div className="teb-section-icon mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "#ffd766" }}>
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-white mb-2" style={{ fontWeight: 900, letterSpacing: "-0.035em", color: "#fff", fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}>
              Talent Hub
            </h1>
            <p className="text-white/85 text-lg">
              {data?.total ?? "—"} inclusive job opportunities from PWD-committed employers
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-sm border border-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded"
            />
            Remote Only
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-border animate-pulse">
                <CardContent className="p-5 h-40" />
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No jobs found matching your filters.</p>
            <p className="text-sm mt-1">Try adjusting your search or removing filters.</p>
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <StaggerItem key={job.id}>
                <JobCard job={job} onApply={setApplyingJob} user={profileData ?? null} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        <div className="mt-10 rounded-xl p-6 text-center" style={{ background: "hsl(204 60% 92%)" }}>
          <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(204 100% 36%)" }} />
          <h3 className="font-bold text-foreground mb-1">Are you an employer?</h3>
          <p className="text-sm text-muted-foreground mb-3">Post your job opening and reach hundreds of skilled PWD candidates.</p>
          <AuthGuard when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-full px-7">
                Sign in to Post a Job
              </Button>
            </SignInButton>
          </AuthGuard>
          <AuthGuard when="signed-in">
            <Button
              size="sm"
              style={{ background: "hsl(204 100% 36%)" }}
              className="text-white rounded-full px-7"
              onClick={() => window.location.href = appPath("/corporate-portal")}
            >
              Post a Job →
            </Button>
          </AuthGuard>
        </div>
      </div>
    </div>
  );
}
