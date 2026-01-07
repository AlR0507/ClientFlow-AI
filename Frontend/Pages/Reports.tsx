import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", value: 8500 },
  { month: "Feb", value: 9200 },
  { month: "Mar", value: 7800 },
  { month: "Apr", value: 10500 },
  { month: "May", value: 11200 },
  { month: "Jun", value: 9800 },
  { month: "Jul", value: 12500 },
  { month: "Aug", value: 11800 },
  { month: "Sep", value: 13200 },
  { month: "Oct", value: 10900 },
  { month: "Nov", value: 14500 },
  { month: "Dec", value: 14600 },
];

const pipelineData = [
  { stage: "New", count: 45 },
  { stage: "Contacted", count: 32 },
  { stage: "Follow-up", count: 28 },
  { stage: "Negotiating", count: 15 },
  { stage: "Closed", count: 12 },
];

const sourceData = [
  { name: "Referrals", value: 35, color: "hsl(225, 73%, 57%)" },
  { name: "Website", value: 25, color: "hsl(142, 76%, 36%)" },
  { name: "Social Media", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Cold Outreach", value: 20, color: "hsl(220, 13%, 70%)" },
];

const metrics = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Clients Acquired",
    value: "48",
    change: "+8 this month",
    trend: "up",
    icon: Users,
  },
  {
    title: "Avg. Response Time",
    value: "2.4 hrs",
    change: "-15%",
    trend: "down",
    icon: Clock,
  },
];

const topClients = [
  { name: "Tech Solutions Inc.", value: "$45,000", deals: 3 },
  { name: "Digital Ventures", value: "$32,500", deals: 2 },
  { name: "Creative Agency", value: "$28,000", deals: 4 },
  { name: "StartupXYZ", value: "$19,000", deals: 1 },
];

export default function Reports() {
  return (
    <div className="min-h-screen">
      <Header title="Reports" subtitle="Track your performance and growth metrics" />

      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 12 months
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-success" />
                    )}
                    <span className="text-xs font-medium text-success">{metric.change}</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Revenue Chart */}
          <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Total Revenue</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue over the year</p>
              </div>
              <Badge className="bg-success/10 text-success border-0">+12.5%</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(222, 15%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(222, 15%, 46%)" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Distribution */}
          <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Pipeline Distribution</h3>
                <p className="text-sm text-muted-foreground">Clients by stage</p>
              </div>
              <Badge variant="outline" className="text-xs">132 total</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(222, 15%, 46%)" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} stroke="hsl(222, 15%, 46%)" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(225, 73%, 57%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Sources */}
          <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Lead Sources</h3>
              <p className="text-sm text-muted-foreground">Where your clients come from</p>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sourceData.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-xs text-muted-foreground">{source.name}</span>
                  <span className="text-xs font-medium text-foreground ml-auto">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="lg:col-span-2 rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Top Clients</h3>
                <p className="text-sm text-muted-foreground">Highest revenue generators</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">View all</Button>
            </div>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.deals} deals closed</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{client.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
