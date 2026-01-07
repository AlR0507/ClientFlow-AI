import { Users, Clock, Target } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PriorityClients } from "@/components/dashboard/PriorityClients";
import { useClients } from "@/hooks/useClients";
import { useReminders } from "@/hooks/useReminders";
import { useDeals } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const { data: deals = [], isLoading: dealsLoading } = useDeals();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClients = clients.length;
    
    // Pending follow-ups (reminders not completed and due soon or overdue)
    const now = new Date();
    const pendingReminders = reminders.filter((reminder) => {
      if (reminder.completed) return false;
      const dueDate = new Date(reminder.due_date);
      return dueDate >= now || dueDate < now;
    });
    const overdueReminders = reminders.filter((reminder) => {
      if (reminder.completed) return false;
      const dueDate = new Date(reminder.due_date);
      return dueDate < now;
    });

    // Closed deals this month
    const nowMonth = new Date();
    const firstDayOfMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1);
    const closedThisMonth = deals.filter((deal: any) => {
      if (deal.stage !== "closed" && deal.stage !== "won") return false;
      const dealDate = new Date(deal.created_at);
      return dealDate >= firstDayOfMonth;
    });

    return [
      {
        title: "Total Clients",
        value: totalClients.toString(),
        change: totalClients > 0 ? `${totalClients} active clients` : "No clients yet",
        changeType: "neutral" as const,
        icon: Users,
      },
      {
        title: "Pending Follow-ups",
        value: pendingReminders.length.toString(),
        change: overdueReminders.length > 0 ? `${overdueReminders.length} overdue` : "All on track",
        changeType: overdueReminders.length > 0 ? ("negative" as const) : ("positive" as const),
        icon: Clock,
      },
      {
        title: "Closed This Month",
        value: closedThisMonth.length.toString(),
        change: closedThisMonth.length > 0 ? `${closedThisMonth.length} deals closed` : "No deals closed yet",
        changeType: "neutral" as const,
        icon: Target,
      },
    ];
  }, [clients, reminders, deals]);

  const isLoading = clientsLoading || remindersLoading || dealsLoading;

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back! Here's your overview." />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : (
            stats.map((stat, index) => (
              <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
                <StatsCard {...stat} />
              </div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriorityClients />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
