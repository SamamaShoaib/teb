import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  FileText, X, Loader2,
  XCircle, Eye, Search, ArrowLeft, ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, withdrawalReasonLabel, type GrantApplicationDetail, type GrantApplicationStatus, type GrantType, type UserProfile } from "@/lib/api";
import { appPath } from "@/lib/basePath";

const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  livelihood_fund: "Livelihood Fund",
  skills_training: "Skills Training",
  assistive_technology: "Assistive Technology",
};

const STATUS_CONFIG: Record<GrantApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  under_review: { label: "Under Review", className: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { label: "Approved", className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-200" },
  withdrawn: { label: "Withdrawn", className: "bg-slate-50 text-slate-600 border-slate-200" },
};

const STATUS_OPTIONS: GrantApplicationStatus[] = ["pending", "under_review", "approved", "rejected", "withdrawn"];
const GRANT_TYPE_OPTIONS: GrantType[] = ["livelihood_fund", "skills_training", "assistive_technology"];

function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

function ApplicationDetailModal({
  application,
  onClose,
}: {
  application: GrantApplicationDetail;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<GrantApplicationStatus>(application.status);

  const mutation = useMutation({
    mutationFn: () => api.grantApplications.updateStatus(application.id, selectedStatus),
    onSuccess: (data) => {
      toast({
        title: "Status updated",
        description: `Application ${application.referenceNumber} is now ${STATUS_CONFIG[data.status].label}.`,
      });
      qc.invalidateQueries({ queryKey: ["adminGrantApplications"] });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const hasChanged = selectedStatus !== application.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">Grant Application</h2>
            <p className="text-sm text-muted-foreground font-mono">{application.referenceNumber}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {application.withdrawnAt ? (
              <Badge className="border text-xs font-medium bg-slate-100 text-slate-700 border-slate-300">
                Withdrawn
              </Badge>
            ) : (
              <Badge className={`border text-xs font-medium ${STATUS_CONFIG[application.status].className}`}>
                {STATUS_CONFIG[application.status].label}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {GRANT_TYPE_LABELS[application.grantType]}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              Submitted {new Date(application.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          {application.withdrawnAt && (
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Withdrawal</h3>
              <p className="text-xs text-muted-foreground">
                Withdrawn by applicant on{" "}
                {new Date(application.withdrawnAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Reason</span>
                <p className="mt-1 text-foreground/90 leading-relaxed">
                  {withdrawalReasonLabel(application.withdrawalReason) ?? (
                    <span className="text-muted-foreground italic">No reason provided</span>
                  )}
                </p>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Full Name</span><p className="font-medium">{application.fullName}</p></div>
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{application.email}</p></div>
              <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{application.phone}</p></div>
              <div><span className="text-muted-foreground">Date of Birth</span><p className="font-medium">{application.dateOfBirth}</p></div>
              <div className="sm:col-span-2"><span className="text-muted-foreground">Address</span><p className="font-medium">{application.address}</p></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Disability Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Type of Disability</span><p className="font-medium">{application.disabilityType}</p></div>
              <div><span className="text-muted-foreground">PWD Certificate No.</span><p className="font-medium">{application.disabilityCertificateNumber}</p></div>
              <div className="sm:col-span-2"><span className="text-muted-foreground">Certifying Physician / Institution</span><p className="font-medium">{application.certifyingPhysician}</p></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Grant Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Grant Type</span><p className="font-medium">{GRANT_TYPE_LABELS[application.grantType]}</p></div>
              <div><span className="text-muted-foreground">Requested Amount</span><p className="font-medium text-primary">{formatPKR(application.requestedAmountPkr)}</p></div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Use Case / Plan</span>
              <p className="mt-1 text-foreground/90 leading-relaxed bg-slate-50 rounded-lg p-3 border border-border">{application.useCase}</p>
            </div>
            {application.additionalNotes && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Additional Notes</span>
                <p className="mt-1 text-foreground/90 leading-relaxed bg-slate-50 rounded-lg p-3 border border-border">{application.additionalNotes}</p>
              </div>
            )}
          </section>

          <section className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Update Status</h3>
            {application.withdrawnAt && (
              <p className="text-xs text-muted-foreground mb-3">
                This application was withdrawn by the applicant and cannot be modified.
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  disabled={!!application.withdrawnAt}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedStatus === s
                      ? `${STATUS_CONFIG[s].className} ring-2 ring-offset-1 ring-current`
                      : "border-border text-muted-foreground hover:border-slate-400"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => mutation.mutate()}
                disabled={!hasChanged || mutation.isPending}
                style={{ background: "hsl(204 100% 36%)" }}
                className="text-white"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Status
              </Button>
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ApplicationRow({
  application,
  onView,
}: {
  application: GrantApplicationDetail;
  onView: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm text-foreground">{application.fullName}</p>
          <span className="text-xs text-muted-foreground font-mono">{application.referenceNumber}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">{GRANT_TYPE_LABELS[application.grantType]}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium" style={{ color: "hsl(204 100% 36%)" }}>{formatPKR(application.requestedAmountPkr)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{new Date(application.createdAt).toLocaleDateString("en-PK")}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {application.withdrawnAt ? (
          <Badge className="border text-xs font-medium hidden sm:inline-flex bg-slate-100 text-slate-700 border-slate-300">
            Withdrawn
          </Badge>
        ) : (
          <Badge className={`border text-xs font-medium hidden sm:inline-flex ${STATUS_CONFIG[application.status].className}`}>
            {STATUS_CONFIG[application.status].label}
          </Badge>
        )}
        <button
          onClick={onView}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-slate-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Review
        </button>
      </div>
    </div>
  );
}

export default function AdminGrantApplications() {
  const [, setLocation] = useLocation();
  const [grantTypeFilter, setGrantTypeFilter] = useState<GrantType | "">("");
  const [statusFilter, setStatusFilter] = useState<GrantApplicationStatus | "">("");
  const [selected, setSelected] = useState<GrantApplicationDetail | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["myProfile"],
    queryFn: api.users.getMe,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const isCaptain = profile?.role === "captain";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminGrantApplications", grantTypeFilter, statusFilter],
    queryFn: () =>
      api.grantApplications.list({
        limit: 100,
        grantType: grantTypeFilter || undefined,
        status: statusFilter || undefined,
      }),
    enabled: isCaptain,
  });

  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;

  const hasFilters = grantTypeFilter !== "" || statusFilter !== "";

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (profile && !isCaptain) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <ShieldOff className="w-12 h-12 mx-auto text-slate-300" />
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">This page is only available to Community Captains.</p>
        <Button onClick={() => setLocation("/dashboard")} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <a
          href={appPath("/dashboard")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(204 100% 36%)" }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Grant Applications</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${total} application${total !== 1 ? "s" : ""}${hasFilters ? " (filtered)" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={grantTypeFilter}
              onChange={(e) => setGrantTypeFilter(e.target.value as GrantType | "")}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Grant Types</option>
              {GRANT_TYPE_OPTIONS.map((gt) => (
                <option key={gt} value={gt}>{GRANT_TYPE_LABELS[gt]}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GrantApplicationStatus | "")}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={() => { setGrantTypeFilter(""); setStatusFilter(""); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading applications…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <XCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm">Failed to load applications. Make sure you are signed in as an admin.</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <Search className="w-8 h-8 text-slate-300" />
            <p className="text-sm">No applications found{hasFilters ? " for the selected filters" : ""}.</p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-2 bg-slate-50 border-b border-border flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="flex-1">Applicant</span>
              <span className="hidden sm:block">Status</span>
              <span className="w-20 text-right">Action</span>
            </div>
            {applications.map((app) => (
              <ApplicationRow
                key={app.id}
                application={app}
                onView={() => setSelected(app)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ApplicationDetailModal
          application={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
