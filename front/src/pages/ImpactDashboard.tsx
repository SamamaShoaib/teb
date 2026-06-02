import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { TrendingUp, Users, Heart, Briefcase, Award, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";

const MOCK_GROWTH_DATA = [
  { name: "Jan", users: 120, jobs: 45 },
  { name: "Feb", users: 300, jobs: 89 },
  { name: "Mar", users: 650, jobs: 180 },
  { name: "Apr", users: 1250, jobs: 432 },
];

const MOCK_REGION_DATA = [
  { name: "Lahore", value: 450 },
  { name: "Karachi", value: 380 },
  { name: "Islamabad", value: 220 },
  { name: "Faisalabad", value: 150 },
  { name: "Others", value: 50 },
];

const COLORS = ["#006fba", "#0088dd", "#ffb800", "#1a1a2e", "#64748b"];

const MOCK_LEDGER = [
  { id: "TX-48291", type: "Distribution", recipient: "Ahmed K. (Lahore)", amount: "Rs 15,000", status: "Verified", hash: "0x8f2d...3a1e" },
  { id: "TX-48290", type: "Donation", donor: "Systems Ltd", amount: "Rs 50,000", status: "Verified", hash: "0x4c1a...9b2c" },
  { id: "TX-48289", type: "Distribution", recipient: "Sara M. (Karachi)", amount: "Rs 25,000", status: "Verified", hash: "0x7e4b...5f6d" },
  { id: "TX-48288", type: "Donation", donor: "Jazz Pakistan", amount: "Rs 25,000", status: "Verified", hash: "0x2d9f...8a1c" },
];

export default function ImpactDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.stats.get,
  });

  return (
    <div className="min-h-screen bg-muted py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="none" className="mb-10 text-center">
          <span className="teb-kicker">Transparency & Impact</span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">Ecosystem Performance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tracking our progress in bridging the gap for Pakistan's PWD community through real-time data and distribution metrics.
          </p>
        </FadeIn>

        {/* Top Level Stats */}
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" stagger={0.1}>
          <StaggerItem>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0, 111, 186, 0.1)", color: "#006fba" }}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Members</p>
                  <p className="text-2xl font-bold">{stats?.totalPwdMembers ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255, 184, 0, 0.1)", color: "#ffb800" }}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Placements</p>
                  <p className="text-2xl font-bold">{stats?.totalJobPlacements ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Donations</p>
                  <p className="text-2xl font-bold">{stats?.totalDonations ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(147, 51, 234, 0.1)", color: "#9333ea" }}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Captains</p>
                  <p className="text-2xl font-bold">{stats?.totalActiveCaptains ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerGroup>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Growth Chart */}
          <FadeIn direction="up" delay={0.2}>
            <Card className="border-none shadow-sm flex-1 min-h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Member & Job Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_GROWTH_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                    <Line type="monotone" dataKey="users" stroke="#006fba" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="jobs" stroke="#ffb800" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Regional Distribution */}
          <FadeIn direction="up" delay={0.3}>
            <Card className="border-none shadow-sm flex-1 min-h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_REGION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {MOCK_REGION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/3 space-y-2">
                  {MOCK_REGION_DATA.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-xs font-medium">{d.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Transparency Ledger */}
        <FadeIn direction="up" delay={0.4} className="mt-10">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <CardTitle className="text-lg font-bold">Transparency Ledger (Immutable Record)</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Activity className="w-3 h-3 animate-pulse text-green-400" />
                Live Network Status: Operational
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-muted-foreground font-medium uppercase text-xxs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Entity</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Verification Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_LEDGER.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-blue-600">{tx.id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xxs font-bold uppercase ${
                            tx.type === "Donation" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{tx.recipient || tx.donor}</td>
                        <td className="px-6 py-4 font-black">{tx.amount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {tx.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xxs text-muted-foreground">{tx.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
