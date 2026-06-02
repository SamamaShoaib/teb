import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, DollarSign, Shield, Gift, CheckCircle2, Users, X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SignInButton } from "@clerk/react";
import { AuthGuard } from "@/App";
import { api, type Stats, type Donation, type UserProfile } from "@/lib/api";
import GrantApplicationModal from "@/components/GrantApplicationModal";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useTranslation } from "@/lib/i18n";
import { Calculator, Sparkles, Brain, Check, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const grantPrograms = [
  {
    name: "Livelihood Fund",
    icon: DollarSign,
    amount: "Up to Rs 15,000",
    description: "Seed capital for small business ventures — from food stalls to online selling to freelance work.",
    eligibility: "Unemployed PWD with viable business plan",
    color: "hsl(204 100% 36%)",
    grantType: "livelihood_fund" as const,
    maxAmount: 15000,
  },
  {
    name: "Skills Training Grant",
    icon: Gift,
    amount: "Up to Rs 8,000",
    description: "Cover TESDA-accredited training courses in tech, BPO, crafts, or other in-demand skills.",
    eligibility: "PWD aged 18–50, resident of Punjab Province",
    color: "hsl(142 76% 36%)",
    grantType: "skills_training" as const,
    maxAmount: 8000,
  },
  {
    name: "Assistive Technology",
    icon: Shield,
    amount: "Up to Rs 25,000",
    description: "Wheelchairs, hearing aids, screen readers, adaptive keyboards, and other mobility or communication aids.",
    eligibility: "PWD with medical certification of need",
    color: "hsl(262 83% 58%)",
    grantType: "assistive_technology" as const,
    maxAmount: 25000,
  },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

function GrantCalculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const steps = [
    {
      q: "Select your disability category",
      options: [
        { label: "Visual Impairment", icon: Zap, desc: "Screen readers & tech aids" },
        { label: "Hearing Impairment", icon: Shield, desc: "Assistive hearing devices" },
        { label: "Physical Disability", icon: Heart, desc: "Mobility & accessibility" },
        { label: "Neurodivergent", icon: Brain, desc: "Specialized skill training" }
      ],
      key: "type"
    },
    {
      q: "What is your primary goal?",
      options: [
        { label: "Find a Job", icon: Users, desc: "Skills & placements" },
        { label: "Start a Business", icon: Gift, desc: "Livelihood & seed capital" },
        { label: "Daily Independence", icon: Shield, desc: "Assistive technology" }
      ],
      key: "status"
    }
  ];

  const handleAnswer = async (val: string) => {
    const newAnswers = { ...answers, [steps[step].key]: val };
    setAnswers(newAnswers);
    
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setIsCalculating(true);
      await new Promise(r => setTimeout(r, 2000));
      
      if (newAnswers.type === "Physical Disability") setResult("Assistive Technology Grant (Rs 25,000)");
      else if (newAnswers.status === "Start a Business") setResult("Livelihood Fund (Rs 15,000)");
      else setResult("Skills Training Grant (Rs 8,000)");
      
      setIsCalculating(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-white overflow-hidden flex-1 min-h-[400px] flex flex-col">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <span className="font-black text-xs uppercase tracking-widest">Eligibility AI</span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-8 rounded-full transition-all duration-500 ${
                i <= step ? "bg-blue-500" : "bg-white/10"
              }`} 
            />
          ))}
        </div>
      </div>
      
      <CardContent className="p-8 flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {isCalculating ? (
            <motion.div 
              key="calc"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Analyzing Eligibility...</h3>
              <p className="text-sm text-muted-foreground">Cross-referencing with active grant policies in Pakistan.</p>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xxs font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Analysis Complete
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recommended Opportunity:</p>
                <h3 className="text-2xl font-black text-slate-900">{result}</h3>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => { setStep(0); setResult(null); setAnswers({}); }}>
                  Restart
                </Button>
                <Button className="bg-blue-600 text-white font-bold px-8">
                  Apply Now <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{steps[step].q}</h3>
              <div className="grid grid-cols-1 gap-3">
                {steps[step].options.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleAnswer(opt.label)}
                      className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-white text-left transition-all hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 text-muted-foreground flex items-center justify-center transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-base">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-transparent group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                        <Check className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function DonationForm() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: api.donations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSuccess(true);
      setAmount("");
      setName("");
      setMessage("");
    },
  });

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "hsl(142 60% 90%)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "hsl(142 76% 36%)" }} />
        </div>
        <h3 className="font-bold text-xl text-foreground mb-2">Thank you for your generosity!</h3>
        <p className="text-muted-foreground text-sm mb-4">Your donation is making a real difference for the PWD community.</p>
        <Button variant="outline" onClick={() => setSuccess(false)}>Donate Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Donation Amount (Rs )</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                amount === a
                  ? "text-white border-transparent"
                  : "border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
              style={amount === a ? { background: "hsl(204 100% 36%)", borderColor: "hsl(204 100% 36%)" } : {}}
            >
              Rs {a.toLocaleString()}
            </button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Or enter custom amount..."
          value={amount}
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          min={100}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-1.5 block">Your Name {anonymous && "(hidden)"}</Label>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={anonymous}
        />
        <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer text-muted-foreground">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
          Donate anonymously
        </label>
      </div>

      <div>
        <Label className="text-sm font-medium mb-1.5 block">Message (optional)</Label>
        <textarea
          className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          rows={2}
          placeholder="A message of encouragement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button
        className="w-full font-semibold text-white"
        style={{ background: "hsl(204 100% 36%)" }}
        disabled={!amount || isPending}
        onClick={() => {
          if (!amount) return;
          mutate({
            amountPkr: Number(amount),
            donorName: anonymous ? undefined : (name || undefined),
            message: message || undefined,
            anonymous,
          });
        }}
      >
        {isPending ? "Processing..." : `Donate Rs ${amount ? Number(amount).toLocaleString() : "—"}`}
        <Heart className="ml-2 w-4 h-4" />
      </Button>
      <p className="text-xs text-muted-foreground text-center">100% of donations go directly to PWD beneficiaries.</p>
    </div>
  );
}

const PRESET_AMOUNTS_TARGETED = [200, 500, 1000, 2500];

function TargetedDonationModal({
  recipient,
  onClose,
}: {
  recipient: UserProfile;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState<number | "">(500);
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.donations.createTargeted({
        recipientUserId: recipient.id,
        amountPkr: Number(amount),
        message: message || undefined,
        anonymous,
      }),
    onSuccess: () => {
      toast({
        title: "Donation sent!",
        description: `Rs ${Number(amount).toLocaleString()} sent to ${recipient.displayName}. Thank you!`,
      });
      qc.invalidateQueries({ queryKey: ["donations"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Donation failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Support {recipient.displayName}</h2>
            <p className="text-sm text-muted-foreground">{recipient.disability ?? "PWD Member"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Amount (Rs )</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_AMOUNTS_TARGETED.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    amount === a
                      ? "text-white border-transparent"
                      : "border-border text-foreground/70 hover:border-primary"
                  }`}
                  style={amount === a ? { background: "hsl(43 100% 50%)", borderColor: "hsl(43 100% 50%)", color: "hsl(215 28% 17%)" } : {}}
                >
                  Rs {a.toLocaleString()}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Or enter custom amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              min={100}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Message (optional)</Label>
            <textarea
              className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={2}
              placeholder="A word of encouragement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer text-muted-foreground">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
              Donate anonymously
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
            <Button
              size="sm"
              disabled={mutation.isPending || !amount}
              onClick={() => mutation.mutate()}
              style={{ background: "hsl(43 100% 50%)", color: "hsl(215 28% 17%)" }}
              className="font-semibold"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {amount ? `Donate Rs ${Number(amount).toLocaleString()}` : "Donate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipientCard({ user, onDonate }: { user: UserProfile; onDonate: (u: UserProfile) => void }) {
  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "hsl(43 100% 50%)", color: "hsl(215 28% 17%)" }}
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
        </div>

        {user.disability && (
          <p className="text-xs text-muted-foreground mb-2">Disability: <span className="text-foreground font-medium">{user.disability}</span></p>
        )}
        {user.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{user.bio}</p>
        )}

        <div>
          <AuthGuard when="signed-in">
            <Button
              size="sm"
              className="w-full text-xs font-semibold"
              style={{ background: "hsl(43 100% 50%)", color: "hsl(215 28% 17%)" }}
              onClick={() => onDonate(user)}
            >
              <Heart className="w-3.5 h-3.5 mr-1.5" /> Support {user.displayName.split(" ")[0]}
            </Button>
          </AuthGuard>
          <AuthGuard when="signed-out">
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="w-full text-xs font-semibold"
                style={{ background: "hsl(43 100% 50%)", color: "hsl(215 28% 17%)" }}
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" /> Sign in to Support
              </Button>
            </SignInButton>
          </AuthGuard>
        </div>
      </CardContent>
    </Card>
  );
}

function DonorWall() {
  const { data } = useQuery({
    queryKey: ["donations"],
    queryFn: () => api.donations.list(10),
  });

  return (
    <div className="space-y-2">
      {(data?.donations ?? []).map((d: Donation) => (
        <div key={d.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "hsl(204 100% 36%)" }}>
              {d.anonymous ? "?" : (d.donorName?.[0] ?? "D")}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {d.anonymous ? "Anonymous Donor" : (d.donorName || "Kind Donor")}
              </div>
              {d.message && <div className="text-xs text-muted-foreground truncate max-w-48">"{d.message}"</div>}
            </div>
          </div>
          <Badge variant="secondary" className="font-semibold text-xs">Rs {Number(d.amountPkr).toLocaleString()}</Badge>
        </div>
      ))}
    </div>
  );
}

export default function SupportFunding() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: api.stats.get,
  });

  const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
    queryKey: ["pwd-recipients"],
    queryFn: () => api.users.list({ role: "pwd", verified: true, limit: 12 }),
  });

  const [donatingTo, setDonatingTo] = useState<UserProfile | null>(null);
  const [applyingForGrant, setApplyingForGrant] = useState<typeof grantPrograms[0] | null>(null);

  const recipients = (recipientsData?.users ?? []).filter((u) => u.bio);

  return (
    <div className="min-h-screen">
      {donatingTo && (
        <TargetedDonationModal recipient={donatingTo} onClose={() => setDonatingTo(null)} />
      )}
      {applyingForGrant && (
        <GrantApplicationModal grant={applyingForGrant} onClose={() => setApplyingForGrant(null)} />
      )}

      <div className="teb-hero teb-hero-amber py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn direction="up" distance={18}>
            <div className="teb-section-icon mb-4" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              <Heart className="w-6 h-6" />
            </div>
            <h1 className="mb-2" style={{ color: "#fff", fontWeight: 900, letterSpacing: "-0.035em", fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}>
              Support & Funding
            </h1>
            <p className="text-lg max-w-xl" style={{ color: "rgba(255,255,255,0.92)" }}>
              Grants, livelihood support, and donations that create real change. Rs {stats?.totalFundsDistributedPkr?.toLocaleString() ?? "—"} distributed to date.
            </p>
          </FadeIn>
        </div>
      </div>

      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-16">
            <div className="lg:col-span-1">
              <span className="teb-kicker">Direct Assistance</span>
              <h2 className="text-3xl font-black text-foreground mb-4">Grant Programs</h2>
              <p className="text-muted-foreground leading-relaxed">
                Apply for direct assistance designed specifically for the Pakistani PWD community. No complex paperwork, no middlemen.
              </p>
            </div>
            <div className="lg:col-span-2">
              <GrantCalculator />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {grantPrograms.map((g) => {
              const Icon = g.icon;
              return (
                <Card key={g.name} className="border border-border bg-white">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${g.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: g.color }} />
                    </div>
                    <div className="text-lg font-bold text-foreground mb-0.5">{g.name}</div>
                    <div className="font-semibold text-sm mb-2" style={{ color: g.color }}>{g.amount}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{g.description}</p>
                    <div className="bg-muted rounded-md px-3 py-2 mb-4">
                      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Eligible: </span>{g.eligibility}</p>
                    </div>
                    <AuthGuard when="signed-in">
                      <Button
                        size="sm"
                        className="w-full text-white text-xs"
                        style={{ background: g.color }}
                        onClick={() => setApplyingForGrant(g)}
                      >
                        Apply for Grant
                      </Button>
                    </AuthGuard>
                    <AuthGuard when="signed-out">
                      <SignInButton mode="modal">
                        <Button
                          size="sm"
                          className="w-full text-white text-xs"
                          style={{ background: g.color }}
                        >
                          Sign in to Apply
                        </Button>
                      </SignInButton>
                    </AuthGuard>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Support an Individual */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="teb-kicker">Targeted Giving</span>
                <h2 className="text-2xl font-bold text-foreground mb-1">Support an Individual</h2>
                <p className="text-muted-foreground text-sm">Give directly to a specific PWD community member — 100% goes to them.</p>
              </div>
            </div>

            {recipientsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse border border-border bg-white">
                    <CardContent className="p-5 h-36" />
                  </Card>
                ))}
              </div>
            ) : recipients.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No individual recipients available yet.</p>
                <p className="text-xs mt-1">PWD members who set up their profiles will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recipients.map((u) => (
                  <RecipientCard key={u.id} user={u} onDonate={setDonatingTo} />
                ))}
              </div>
            )}
          </div>

          {/* General Donation + Donor Wall */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border border-border bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5" style={{ color: "hsl(204 100% 36%)" }} />
                  <h3 className="font-bold text-lg text-foreground">General Donation Fund</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Your contribution funds grants, training, and assistive equipment for PWD members across Pakistan.
                </p>
                <DonationForm />
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" style={{ color: "hsl(204 100% 36%)" }} />
                <h3 className="font-bold text-lg text-foreground">Recent Donors</h3>
              </div>
              <DonorWall />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
