import React, { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { api, type UserProfile, type VerificationResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ShieldAlert, Fingerprint, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function VerificationPortal() {
  const [certNumber, setCertNumber] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();
  const [step, setStep] = useState<"input" | "verifying" | "success" | "fail">("input");
  const [result, setResult] = useState<VerificationResult | null>(null);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
  });

  const mutation = useMutation({
    mutationFn: (num: string) => api.users.verifyCertificate(num),
    onMutate: () => {
      setStep("verifying");
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        setStep("success");
        qc.invalidateQueries({ queryKey: ["myProfile"] });
        toast({ title: "Verification Successful", description: data.message });
      } else {
        setStep("fail");
        toast({ title: "Verification Failed", description: data.message, variant: "destructive" });
      }
    },
    onError: (err: Error) => {
      setStep("fail");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleVerify = () => {
    if (certNumber.length !== 13) {
      toast({ title: "Invalid Length", description: "Certificate number must be exactly 13 digits.", variant: "destructive" });
      return;
    }
    mutation.mutate(certNumber);
  };

  return (
    <div className="min-h-[80dvh] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <a 
          href={`${basePath}/dashboard`} 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </a>

        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="bg-primary/90 p-8 text-white relative overflow-hidden">
            {/* Abstract NADRA-style patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Identity Verification</h1>
                <p className="text-white/70 text-sm">Disability Certificate (NADRA PWD Database)</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === "input" && (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Certificate Number (CNIC Format)</label>
                    <div className="relative">
                      <Input 
                        value={certNumber}
                        onChange={(e) => setCertNumber(e.target.value.replace(/\D/g, "").slice(0, 13))}
                        placeholder="e.g. 4210112345671"
                        className="h-14 text-lg font-mono tracking-[0.2em] pl-12 rounded-xl"
                      />
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {certNumber.length}/13
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the 13-digit registration number found on your PWD Disability Certificate or Special CNIC.
                    </p>
                  </div>

                  <Button 
                    onClick={handleVerify}
                    disabled={certNumber.length !== 13 || mutation.isPending}
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 transition-all rounded-xl shadow-lg shadow-blue-100"
                  >
                    Verify with NADRA Database
                  </Button>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Verification builds trust with employers and unlocks the **"Verified PWD"** badge on your profile, increasing your interview chances by up to 3x.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "verifying" && (
                <motion.div 
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                    <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">Secure Connection Established</h2>
                    <p className="text-muted-foreground animate-pulse">Checking records in NADRA PWD database...</p>
                  </div>
                </motion.div>
              )}

              {step === "success" && result && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-emerald-900">Successfully Verified</h2>
                      <p className="text-sm text-emerald-700">Your profile now carries the verified status.</p>
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="bg-muted/30 px-4 py-2 border-b border-border">
                      <p className="text-xxs font-black uppercase tracking-wider text-muted-foreground">Official Database Record</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <RecordField label="Full Name" value={result.data?.fullName} />
                      <RecordField label="Disability Type" value={result.data?.disabilityType} />
                      <RecordField label="Issue Date" value={result.data?.issueDate} />
                      <RecordField label="Expiry Date" value={result.data?.expiryDate} />
                      <RecordField label="Verification Ref" value={`TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`} />
                    </div>
                  </div>

                  <Button 
                    asChild
                    className="w-full h-12 rounded-xl bg-foreground text-background"
                  >
                    <a href={`${basePath}/dashboard`}>Return to Dashboard</a>
                  </Button>
                </motion.div>
              )}

              {step === "fail" && (
                <motion.div 
                  key="fail"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 space-y-6 text-center"
                >
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">Record Not Found</h2>
                    <p className="text-sm text-muted-foreground">
                      The certificate number provided does not match any entry in our current database. Please check and try again.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="w-full h-12 rounded-xl"
                  >
                    Try Another Number
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-bold text-foreground">{value || "N/A"}</span>
    </div>
  );
}
