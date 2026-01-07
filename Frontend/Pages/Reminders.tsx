import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Video,
  Plus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddReminderDialog } from "@/components/dialogs/AddReminderDialog";
import { useReminders, useUpdateReminder } from "@/hooks/useReminders";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isPast, parseISO } from "date-fns";

type ReminderType = "call" | "email" | "meeting" | "follow-up";

const typeIcons: Record<ReminderType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Video,
  "follow-up": Clock,
};

const typeColors: Record<ReminderType, string> = {
  call: "bg-success/10 text-success",
  email: "bg-primary/10 text-primary",
  meeting: "bg-warning/10 text-warning",
  "follow-up": "bg-muted text-muted-foreground",
};

export default function Reminders() {
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");
  const [addReminderOpen, setAddReminderOpen] = useState(false);
  const { data: reminders = [], isLoading } = useReminders();
  const updateReminder = useUpdateReminder();

  const processedReminders = useMemo(() => {
    return reminders.map((r) => {
      const dueDate = parseISO(r.due_date);
      const isOverdue = isPast(dueDate) && !isToday(dueDate) && !r.completed;
      const isDueToday = isToday(dueDate);
      return {
        ...r,
        isOverdue,
        isDueToday,
        formattedDate: isDueToday ? "Today" : format(dueDate, "MMM d"),
      };
    });
  }, [reminders]);

  const filteredReminders = useMemo(() => {
    return processedReminders.filter((r) => {
      if (filter === "today") return r.isDueToday;
      if (filter === "overdue") return r.isOverdue;
      return true;
    });
  }, [processedReminders, filter]);

  const overdueCount = processedReminders.filter((r) => r.isOverdue && !r.completed).length;
  const todayCount = processedReminders.filter((r) => r.isDueToday && !r.completed).length;

  const toggleComplete = (id: string, currentValue: boolean) => {
    updateReminder.mutate({ id, completed: !currentValue });
  };

  return (
    <div className="min-h-screen">
      <Header title="Reminders" subtitle="Stay on top of your follow-ups and tasks" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all duration-200",
              filter === "all"
                ? "bg-primary/10 border-primary"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{reminders.length}</p>
                <p className="text-sm text-muted-foreground">All Reminders</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilter("today")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all duration-200",
              filter === "today"
                ? "bg-primary/10 border-primary"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{todayCount}</p>
                <p className="text-sm text-muted-foreground">Due Today</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilter("overdue")}
            className={cn(
              "rounded-xl border p-4 text-left transition-all duration-200",
              filter === "overdue"
                ? "bg-destructive/10 border-destructive"
                : "bg-card border-border hover:border-destructive/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </button>
        </div>

        {/* Reminders List */}
        <div className="rounded-xl bg-card border border-border shadow-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              {filter === "all" ? "All Reminders" : filter === "today" ? "Today's Reminders" : "Overdue Reminders"}
            </h2>
            <Button className="gap-2" onClick={() => setAddReminderOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
            <AddReminderDialog open={addReminderOpen} onOpenChange={setAddReminderOpen} />
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : filteredReminders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No reminders found. Add your first reminder to get started.
              </div>
            ) : (
              filteredReminders.map((reminder, index) => {
                const TypeIcon = typeIcons[(reminder.type as ReminderType) || "follow-up"];
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors animate-slide-up",
                      reminder.completed && "opacity-60"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Checkbox
                      checked={reminder.completed || false}
                      onCheckedChange={() => toggleComplete(reminder.id, reminder.completed || false)}
                      className="h-5 w-5"
                    />

                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", typeColors[(reminder.type as ReminderType) || "follow-up"])}>
                      <TypeIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium text-foreground", reminder.completed && "line-through")}>
                        {reminder.title}
                      </p>
                      {reminder.related_to && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{reminder.related_to}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className={cn("text-sm", reminder.isOverdue ? "text-destructive font-medium" : "text-foreground")}>
                        {reminder.formattedDate}
                      </p>
                      <p className="text-xs text-muted-foreground">{reminder.due_time || ""}</p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize hidden md:inline-flex",
                        reminder.priority === "high" && "border-destructive/50 text-destructive bg-destructive/10",
                        reminder.priority === "medium" && "border-warning/50 text-warning bg-warning/10",
                        reminder.priority === "low" && "border-muted-foreground/50 text-muted-foreground"
                      )}
                    >
                      {reminder.priority || "medium"}
                    </Badge>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
