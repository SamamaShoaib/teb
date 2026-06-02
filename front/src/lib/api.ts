const BASE = "/api";
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

const STORAGE_KEY = "teb_mock_state";

function getMockState() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved) return JSON.parse(saved);
  return {
    stats: MOCK_STATS,
    user: MOCK_USER,
    jobs: MOCK_JOBS,
    captains: MOCK_CAPTAINS,
    donations: MOCK_DONATIONS,
    users: [],
    grantApplications: [],
    captainRequests: [],
  };
}

function saveMockState(state: any) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (MOCK_MODE) {
    console.log(`[MOCK API PERSISTENT] ${init?.method ?? "GET"} ${path}`);
    await new Promise((r) => setTimeout(r, 400));
    
    const state = getMockState();
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(init.body as string) : null;

    if (method === "GET") {
      if (path === "/stats") return state.stats as T;
      if (path === "/users/me") return state.user as T;
      if (path.startsWith("/jobs")) return { jobs: state.jobs, total: state.jobs.length } as T;
      if (path.startsWith("/captains")) return { captains: state.captains, total: state.captains.length } as T;
      if (path.startsWith("/donations")) return { donations: state.donations, total: state.donations.length } as T;
      if (path === "/grant-applications/mine") return { applications: state.grantApplications } as T;
    }

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      if (path === "/users/me") {
        state.user = { ...state.user, ...body };
        saveMockState(state);
        return state.user as T;
      }
      if (path === "/donations/general" || path === "/donations") {
        const newDonation = { id: state.donations.length + 1, ...body, createdAt: new Date().toISOString() };
        state.donations.unshift(newDonation);
        state.stats.totalFundsDistributedPkr += (body.amountPkr || 0);
        saveMockState(state);
        return newDonation as T;
      }
      if (path === "/grant-applications") {
        const newApp = { id: state.grantApplications.length + 1, referenceNumber: `TEB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, status: "pending", ...body, createdAt: new Date().toISOString() };
        state.grantApplications.unshift(newApp);
        saveMockState(state);
        return newApp as T;
      }
      if (path === "/users/verify-certificate") {
        const certNumber = body.certNumber;
        // Mock NADRA check: valid if 13 digits (CNIC-like)
        if (certNumber.length === 13) {
          state.user.isVerified = true;
          state.user.certificateNumber = certNumber;
          saveMockState(state);
          return {
            success: true,
            message: "Verified via NADRA PWD Database",
            data: {
              fullName: state.user.displayName,
              disabilityType: state.user.disability || "Physical Disability",
              issueDate: "2023-05-20",
              expiryDate: "2028-05-20",
            }
          } as T;
        }
        return {
          success: false,
          message: "Invalid Certificate Number. Record not found in NADRA Database."
        } as T;
      }
    }
    return {} as T;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      if (j.error) msg = j.error;
    } catch {
      // ignore
    }
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

const MOCK_STATS = {
  totalPwdMembers: 1250,
  totalJobPlacements: 432,
  totalFundsDistributedPkr: 2500000,
  totalCorporatePartners: 45,
  totalActiveCaptains: 28,
  totalDonations: 156,
};

const MOCK_USER = {
  id: 1,
  clerkUserId: "user_mock",
  role: "pwd",
  displayName: "Ahmed Khan",
  location: "Lahore, Pakistan",
  kycVerified: true,
  isVerified: false,
  certificateNumber: undefined,
  avatarInitials: "AK",
  createdAt: new Date().toISOString(),
};

const MOCK_JOBS: Job[] = [
  {
    id: 1,
    companyName: "Systems Limited",
    title: "Junior Web Developer",
    description: "Looking for a passionate developer with a focus on React. We provide screen readers and flexible hours.",
    type: "full_time",
    location: "Lahore",
    remote: true,
    salaryMin: 60000,
    salaryMax: 90000,
    skills: ["React", "JavaScript", "CSS"],
    accommodations: "Screen reader support, Ergonomic workspace",
    createdAt: new Date().toISOString(),
    applicationCount: 5,
  },
  {
    id: 2,
    companyName: "Jazz",
    title: "Customer Support Executive",
    description: "Handling customer queries via chat and email. Accessible office location with wheelchair access.",
    type: "full_time",
    location: "Islamabad",
    remote: false,
    salaryMin: 45000,
    salaryMax: 55000,
    skills: ["Communication", "English", "Typing"],
    accommodations: "Wheelchair ramp, Assistive software",
    createdAt: new Date().toISOString(),
    applicationCount: 12,
  },
  {
    id: 3,
    companyName: "Afiniti",
    title: "QA Engineer",
    description: "Test our cutting-edge AI solutions. We welcome candidates with visual or hearing impairments.",
    type: "full_time",
    location: "Karachi",
    remote: true,
    salaryMin: 80000,
    salaryMax: 120000,
    skills: ["Testing", "Selenium", "Python"],
    accommodations: "Sign language interpretation, Subtitled meetings",
    createdAt: new Date().toISOString(),
    applicationCount: 3,
  },
  {
    id: 4,
    companyName: "Telenor Pakistan",
    title: "Data Entry Specialist",
    description: "Help us maintain our customer database. Flexible shifts available.",
    type: "part_time",
    location: "Islamabad",
    remote: true,
    salaryMin: 25000,
    salaryMax: 35000,
    skills: ["Excel", "Data Accuracy", "Attention to detail"],
    accommodations: "Magnification software, Flexible breaks",
    createdAt: new Date().toISOString(),
    applicationCount: 20,
  }
];

const MOCK_CAPTAINS: Captain[] = [
  {
    id: 1,
    displayName: "Saira Bano",
    location: "Karachi",
    bio: "Aspiring software engineer specializing in accessible web design.",
    isVerified: true,
    certificateNumber: "NADRA-PWD-2023-8821",
    avatarInitials: "SB",
    assignedCount: 15,
    successCount: 12,
  },
  {
    id: 2,
    displayName: "Zahid Ahmed",
    location: "Lahore",
    bio: "Advocate for disability rights and career coach. Helping you navigate the corporate world.",
    avatarInitials: "ZA",
    assignedCount: 22,
    successCount: 18,
  },
  {
    id: 3,
    displayName: "Mariam Khan",
    location: "Islamabad",
    bio: "Specialist in assistive technologies. I can help you find the right tools for your workplace.",
    avatarInitials: "MK",
    assignedCount: 8,
    successCount: 7,
  }
];

const MOCK_DONATIONS: Donation[] = [
  {
    id: 1,
    donorName: "Anwar Maqsood",
    amountPkr: 50000,
    message: "Keep up the great work!",
    anonymous: false,
    createdAt: new Date().toISOString(),
  },
];

export interface Job {
  id: number;
  companyName: string;
  title: string;
  description: string;
  type: "full_time" | "part_time" | "freelance" | "internship";
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  accommodations: string;
  createdAt: string;
  applicationCount: number;
}

export interface Captain {
  id: number;
  displayName: string;
  location: string;
  role: UserRole;
  isVerified?: boolean;
  certificateNumber?: string;
  avatarInitials?: string;
  assignedCount: number;
  successCount: number;
}

export interface CaptainSession {
  id: number;
  message: string | null;
  status: "pending" | "accepted" | "completed" | "declined";
  createdAt: string;
  requesterName: string;
  requesterLocation: string | null;
  requesterDisability: string | null;
  requesterInitials: string | null;
}

export interface Stats {
  totalPwdMembers: number;
  totalJobPlacements: number;
  totalFundsDistributedPkr: number;
  totalCorporatePartners: number;
  totalActiveCaptains: number;
  totalDonations: number;
}

export interface Donation {
  id: number;
  donorName: string | null;
  amountPkr: number;
  message: string | null;
  anonymous: boolean;
  createdAt: string;
}

export type UserRole = "pwd" | "corporate" | "donor" | "captain";

export interface UserProfile {
  id: number;
  clerkUserId: string;
  role: UserRole;
  displayName: string;
  bio?: string | null;
  location?: string | null;
  skills?: string[] | null;
  disability?: string | null;
  companyName?: string | null;
  website?: string | null;
  kycVerified: boolean;
  isVerified: boolean;
  certificateNumber?: string | null;
  pslVideoUrl?: string | null;
  avatarInitials?: string | null;
  createdAt: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    fullName: string;
    disabilityType: string;
    issueDate: string;
    expiryDate: string;
  };
}

export type GrantApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
export type GrantType = "livelihood_fund" | "skills_training" | "assistive_technology";

export interface GrantApplicationResult {
  id: number;
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export interface GrantApplicationDetail {
  id: number;
  referenceNumber: string;
  grantType: GrantType;
  status: GrantApplicationStatus;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  disabilityType: string;
  disabilityCertificateNumber: string;
  certifyingPhysician: string;
  requestedAmountPkr: number;
  useCase: string;
  additionalNotes: string | null;
  withdrawnAt: string | null;
  withdrawalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalReasonCode =
  | "situation_changed"
  | "found_another_source"
  | "submitted_by_mistake"
  | "no_longer_needed"
  | "other";

export const WITHDRAWAL_REASON_PRESETS: { code: WithdrawalReasonCode; label: string }[] = [
  { code: "situation_changed", label: "My situation changed" },
  { code: "found_another_source", label: "I found another source of support" },
  { code: "submitted_by_mistake", label: "I submitted by mistake" },
  { code: "no_longer_needed", label: "I no longer need the grant" },
  { code: "other", label: "Other" },
];

export function withdrawalReasonLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const preset = WITHDRAWAL_REASON_PRESETS.find((p) => p.code === value);
  return preset ? preset.label : value;
}

export const api = {
  grantApplications: {
    mine: () =>
      apiFetch<{ applications: Array<{
        id: number;
        referenceNumber: string;
        grantType: GrantType;
        status: GrantApplicationStatus;
        fullName: string;
        requestedAmountPkr: number;
        createdAt: string;
        updatedAt: string;
        withdrawnAt: string | null;
        withdrawalReason: string | null;
      }> }>("/grant-applications/mine"),
    mineGet: (id: number) => apiFetch<GrantApplicationDetail>(`/grant-applications/mine/${id}`),
    withdraw: (id: number, withdrawalReason?: string) =>
      apiFetch<{ id: number; withdrawn: boolean }>(`/grant-applications/mine/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ withdrawalReason: withdrawalReason ?? null }),
      }),
    submit: (data: {
      grantType: "livelihood_fund" | "skills_training" | "assistive_technology";
      fullName: string;
      email: string;
      phone: string;
      address: string;
      dateOfBirth: string;
      disabilityType: string;
      disabilityCertificateNumber: string;
      certifyingPhysician: string;
      useCase: string;
      requestedAmountPkr: number;
      additionalNotes?: string;
    }) =>
      apiFetch<GrantApplicationResult>("/grant-applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (params?: { limit?: number; offset?: number; grantType?: GrantType; status?: GrantApplicationStatus }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      if (params?.grantType) q.set("grantType", params.grantType);
      if (params?.status) q.set("status", params.status);
      return apiFetch<{ applications: GrantApplicationDetail[]; total: number }>(`/grant-applications?${q}`);
    },
    updateStatus: (id: number, status: GrantApplicationStatus) =>
      apiFetch<{ id: number; referenceNumber: string; status: GrantApplicationStatus; updatedAt: string }>(
        `/grant-applications/${id}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      ),
  },
  jobs: {
    list: (params?: { limit?: number; type?: string; remote?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.type) q.set("type", params.type);
      if (params?.remote !== undefined) q.set("remote", String(params.remote));
      return apiFetch<{ jobs: Job[]; total: number }>(`/jobs?${q}`);
    },
    get: (id: number) => apiFetch<Job>(`/jobs/${id}`),
    create: (data: {
      title: string;
      description: string;
      type: string;
      location?: string;
      remote: boolean;
      salaryMin?: number;
      salaryMax?: number;
      skills?: string[];
      accommodations?: string;
    }) =>
      apiFetch<Job>("/jobs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    apply: (jobId: number, data: { coverLetter?: string }) =>
      apiFetch<{ id: number; status: string }>(`/jobs/${jobId}/apply`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  captains: {
    list: (limit?: number) => {
      const q = limit ? `?limit=${limit}` : "";
      return apiFetch<{ captains: Captain[]; total: number }>(`/captains${q}`);
    },
    myProfile: () => apiFetch<{ id: number; assignedCount: number; successCount: number }>("/captains/my-profile"),
    myRequests: () => apiFetch<{ sessions: CaptainSession[]; total: number }>("/captains/my-requests"),
    updateRequest: (sessionId: number, status: string) =>
      apiFetch<CaptainSession>(`/captains/my-requests/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    requestSession: (captainId: number, data: { message?: string }) =>
      apiFetch<{ id: number; status: string }>(`/captains/${captainId}/request`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  stats: {
    get: () => apiFetch<Stats>("/stats"),
  },
  donations: {
    list: (limit?: number) => {
      const q = limit ? `?limit=${limit}` : "";
      return apiFetch<{ donations: Donation[]; total: number }>(`/donations${q}`);
    },
    create: (data: { amountPkr: number; donorName?: string; message?: string; anonymous?: boolean }) =>
      apiFetch<Donation>("/donations/general", { method: "POST", body: JSON.stringify(data) }),
    createTargeted: (data: {
      recipientUserId: number;
      amountPkr: number;
      message?: string;
      anonymous?: boolean;
    }) =>
      apiFetch<Donation>("/donations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  users: {
    getMe: () => apiFetch<UserProfile>("/users/me"),
    list: (params?: { role?: UserRole; limit?: number; offset?: number; verified?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.role) q.set("role", params.role);
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      if (params?.verified !== undefined) q.set("verified", String(params.verified));
      return apiFetch<{ users: UserProfile[]; total: number }>(`/users?${q}`);
    },
    updateProfile: (data: {
      displayName: string;
      role: UserRole;
      bio?: string;
      location?: string;
      skills?: string[];
      disability?: string;
      companyName?: string;
      website?: string;
      pslVideoUrl?: string;
    }) =>
      apiFetch<UserProfile>("/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    verifyCertificate: (certNumber: string) =>
      apiFetch<VerificationResult>("/users/verify-certificate", {
        method: "POST",
        body: JSON.stringify({ certNumber }),
      }),
  },
};
