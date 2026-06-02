import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface GrantProgram {
  name: string;
  amount: string;
  color: string;
  grantType: "livelihood_fund" | "skills_training" | "assistive_technology";
  maxAmount: number;
}

interface Props {
  grant: GrantProgram;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  disabilityType: string;
  disabilityCertificateNumber: string;
  certifyingPhysician: string;
  useCase: string;
  requestedAmountPkr: string;
  additionalNotes: string;
}

const STEPS = ["Personal Info", "Disability Cert", "Grant Details", "Review"];

function StepIndicator({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={
              i < current
                ? { background: color, color: "#fff" }
                : i === current
                ? { background: color, color: "#fff", boxShadow: `0 0 0 3px ${color}33` }
                : { background: "#e5e7eb", color: "#9ca3af" }
            }
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="h-0.5 w-8 transition-all"
              style={{ background: i < current ? color : "#e5e7eb" }}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground font-medium">
        Step {current + 1} of {total} — {STEPS[current]}
      </span>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default function GrantApplicationModal({ grant, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    disabilityType: "",
    disabilityCertificateNumber: "",
    certifyingPhysician: "",
    useCase: "",
    requestedAmountPkr: String(grant.maxAmount),
    additionalNotes: "",
  });

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const mutation = useMutation({
    mutationFn: () =>
      api.grantApplications.submit({
        grantType: grant.grantType,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        disabilityType: form.disabilityType,
        disabilityCertificateNumber: form.disabilityCertificateNumber,
        certifyingPhysician: form.certifyingPhysician,
        useCase: form.useCase,
        requestedAmountPkr: Number(form.requestedAmountPkr),
        additionalNotes: form.additionalNotes || undefined,
      }),
  });

  function validateStep(s: number): Partial<FormData> {
    const e: Partial<FormData> = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    }
    if (s === 1) {
      if (!form.disabilityType.trim()) e.disabilityType = "Disability type is required";
      if (!form.disabilityCertificateNumber.trim()) e.disabilityCertificateNumber = "Certificate number is required";
      if (!form.certifyingPhysician.trim()) e.certifyingPhysician = "Certifying physician is required";
    }
    if (s === 2) {
      if (!form.useCase.trim() || form.useCase.trim().length < 30)
        e.useCase = "Please describe your use case in at least 30 characters";
      const amt = Number(form.requestedAmountPkr);
      if (!amt || amt < 100 || amt > grant.maxAmount)
        e.requestedAmountPkr = `Amount must be between Rs 100 and Rs ${grant.maxAmount.toLocaleString()}`;
    }
    return e;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep((s) => s + 1);
  }

  function handleSubmit() {
    mutation.mutate();
  }

  const inputClass = (field: keyof FormData) =>
    errors[field] ? "border-red-400 focus:ring-red-400" : "";

  if (mutation.isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `${grant.color}20` }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: grant.color }} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your application for the <strong>{grant.name}</strong> has been received and is now under review.
          </p>
          <div
            className="rounded-xl px-6 py-4 mb-6 text-center"
            style={{ background: `${grant.color}15`, border: `1px solid ${grant.color}40` }}
          >
            <p className="text-xs text-muted-foreground mb-1">Reference Number</p>
            <p className="text-lg font-bold font-mono" style={{ color: grant.color }}>
              {mutation.data?.referenceNumber}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Please save this reference number. Our team will contact you within 5–7 business days.
          </p>
          <Button
            className="w-full font-semibold text-white"
            style={{ background: grant.color }}
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Apply for {grant.name}</h2>
            <p className="text-sm text-muted-foreground">{grant.amount} available</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-4 mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <StepIndicator current={step} total={STEPS.length} color={grant.color} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {step === 0 && (
            <FieldGroup>
              <Field label="Full Name" required>
                <Input placeholder="Juan dela Cruz" value={form.fullName} onChange={set("fullName")} className={inputClass("fullName")} />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </Field>
              <Field label="Email Address" required>
                <Input type="email" placeholder="juan@example.com" value={form.email} onChange={set("email")} className={inputClass("email")} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </Field>
              <Field label="Phone Number" required>
                <Input placeholder="09XX XXX XXXX" value={form.phone} onChange={set("phone")} className={inputClass("phone")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </Field>
              <Field label="Home Address" required>
                <Input placeholder="Street, Barangay, City, Province" value={form.address} onChange={set("address")} className={inputClass("address")} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </Field>
              <Field label="Date of Birth" required>
                <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={inputClass("dateOfBirth")} />
                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </Field>
            </FieldGroup>
          )}

          {step === 1 && (
            <FieldGroup>
              <Field label="Type of Disability" required hint="e.g. Visual Impairment, Hearing Loss, Mobility Impairment">
                <Input placeholder="Describe your disability" value={form.disabilityType} onChange={set("disabilityType")} className={inputClass("disabilityType")} />
                {errors.disabilityType && <p className="text-xs text-red-500 mt-1">{errors.disabilityType}</p>}
              </Field>
              <Field label="PWD ID / Certificate Number" required hint="As printed on your PWD identification card or certification">
                <Input placeholder="e.g. PWD-2024-123456" value={form.disabilityCertificateNumber} onChange={set("disabilityCertificateNumber")} className={inputClass("disabilityCertificateNumber")} />
                {errors.disabilityCertificateNumber && <p className="text-xs text-red-500 mt-1">{errors.disabilityCertificateNumber}</p>}
              </Field>
              <Field label="Certifying Physician / Institution" required hint="Name of the doctor or hospital that issued your disability certificate">
                <Input placeholder="Dr. Maria Santos / Philippine General Hospital" value={form.certifyingPhysician} onChange={set("certifyingPhysician")} className={inputClass("certifyingPhysician")} />
                {errors.certifyingPhysician && <p className="text-xs text-red-500 mt-1">{errors.certifyingPhysician}</p>}
              </Field>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <Field label="How will you use this grant?" required hint="Minimum 30 characters. Be specific about your plan.">
                <textarea
                  className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary ${errors.useCase ? "border-red-400" : "border-border"}`}
                  rows={5}
                  placeholder={
                    grant.grantType === "livelihood_fund"
                      ? "e.g. I plan to start a small sari-sari store in our barangay. I already have a location and initial suppliers lined up..."
                      : grant.grantType === "skills_training"
                      ? "e.g. I want to enroll in a TESDA-accredited web development course to get a remote job as a developer..."
                      : "e.g. I need a motorized wheelchair to commute to work independently. My current manual chair is too difficult to use daily..."
                  }
                  value={form.useCase}
                  onChange={set("useCase")}
                />
                <div className="flex justify-between items-start mt-1">
                  {errors.useCase ? <p className="text-xs text-red-500">{errors.useCase}</p> : <span />}
                  <span className="text-xs text-muted-foreground">{form.useCase.length} chars</span>
                </div>
              </Field>
              <Field label="Requested Amount (Rs )" required hint={`Maximum: Rs ${grant.maxAmount.toLocaleString()}`}>
                <Input
                  type="number"
                  min={100}
                  max={grant.maxAmount}
                  value={form.requestedAmountPkr}
                  onChange={set("requestedAmountPkr")}
                  className={inputClass("requestedAmountPkr")}
                />
                {errors.requestedAmountPkr && <p className="text-xs text-red-500 mt-1">{errors.requestedAmountPkr}</p>}
              </Field>
              <Field label="Additional Notes (optional)">
                <textarea
                  className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={2}
                  placeholder="Any other information you'd like to share..."
                  value={form.additionalNotes}
                  onChange={set("additionalNotes")}
                />
              </Field>
            </FieldGroup>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4 mb-2"
                style={{ background: `${grant.color}10`, border: `1px solid ${grant.color}30` }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: grant.color }}>
                  Applying for
                </p>
                <p className="font-bold text-foreground">{grant.name}</p>
                <p className="text-sm text-muted-foreground">
                  Requesting Rs {Number(form.requestedAmountPkr).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Full Name", form.fullName],
                  ["Email", form.email],
                  ["Phone", form.phone],
                  ["Date of Birth", form.dateOfBirth],
                  ["Disability Type", form.disabilityType],
                  ["PWD Certificate No.", form.disabilityCertificateNumber],
                  ["Certifying Physician", form.certifyingPhysician],
                ].map(([label, value]) => (
                  <div key={label} className="col-span-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground truncate">{value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">{form.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Use Case</p>
                  <p className="text-sm font-medium text-foreground line-clamp-3">{form.useCase}</p>
                </div>
              </div>

              {mutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {mutation.error instanceof Error ? mutation.error.message : "Submission failed. Please try again."}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                By submitting, you confirm that all information provided is accurate and truthful.
                False information may result in disqualification.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-border">
          {step > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)} disabled={mutation.isPending}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              size="sm"
              className="font-semibold text-white"
              style={{ background: grant.color }}
              onClick={handleNext}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="font-semibold text-white"
              style={{ background: grant.color }}
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
