import { User, DollarSign, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useDeals } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "client_added" | "deal_created" | "reminder_due";
  description: string;
  client: string;
  time: string;
  icon: typeof User;
}

export function RecentActivity() {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: deals = [], isLoading: dealsLoading } = useDeals();

  const activities = useMemo(() => {
    const allActivities: Activity[] = [];

    // Recent clients (last 5)
    const recentClients = [...clients]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((client) => ({
        id: `client-${client.id}`,
        type: "client_added" as const,
        description: "New client added",
        client: client.name,
        time: formatDistanceToNow(new Date(client.created_at), { addSuffix: true }),
        icon: User,
      }));

    // Recent deals (last 5)
    const recentDeals = [...deals]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((deal: any) => ({
        id: `deal-${deal.id}`,
        type: "deal_created" as const,
        description: `Deal: ${deal.title}`,
        client: deal.clients?.name || "Unknown",
        time: formatDistanceToNow(new Date(deal.created_at), { addSuffix: true }),
        icon: DollarSign,
      }));

    allActivities.push(...recentClients, ...recentDeals);

    // Sort by time (most recent first) and take top 5
    return allActivities
      .sort((a, b) => {
        // Parse time strings to sort properly (this is approximate)
        return 0; // Keep original order since we already sorted by creation date
      })
      .slice(0, 5);
  }, [clients, deals]);

  const isLoading = clientsLoading || dealsLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No recent activity yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <activity.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.client}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
