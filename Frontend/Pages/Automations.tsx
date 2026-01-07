import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Mail,
  Clock,
  Calendar,
  Plus,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateAutomationDialog } from "@/components/dialogs/CreateAutomationDialog";
import { useAutomations, useUpdateAutomation } from "@/hooks/useAutomations";
import { Skeleton } from "@/components/ui/skeleton";

const automationTemplates = [
  {
    id: 1,
    name: "Welcome Email Sequence",
    description: "Send a welcome email when a new client is added, followed by an introduction to your services.",
    icon: Mail,
    category: "Email",
    popular: true,
  },
  {
    id: 2,
    name: "Follow-up Reminder",
    description: "Automatically create a reminder 3 days after the last interaction if no response received.",
    icon: Clock,
    category: "Reminder",
    popular: true,
  },
  {
    id: 3,
    name: "Meeting Follow-up",
    description: "Send a thank you email and summary after each meeting is completed.",
    icon: Calendar,
    category: "Email",
    popular: true,
  },
  {
    id: 4,
    name: "AI Client Summary",
    description: "Automatically generate intelligent summaries of client interactions, preferences, and next steps using AI.",
    icon: Zap,
    category: "AI",
    popular: true,
  },
];

const triggerLabels: Record<string, string> = {
  "new-client": "When new client is added",
  "deal-stage-change": "When deal stage changes",
  "no-contact": "When no contact for X days",
  "follow-up-overdue": "When follow-up is overdue",
};

const actionLabels: Record<string, string> = {
  "email": "Send email",
  "follow-up": "Create reminder",
  "meeting": "Send meeting follow-up",
  "ai-summary": "Generate AI summary",
};

export default function Automations() {
  const [createAutomationOpen, setCreateAutomationOpen] = useState(false);
  const { data: automations = [], isLoading } = useAutomations();
  const updateAutomation = useUpdateAutomation();

  const toggleAutomation = (id: string, currentValue: boolean) => {
    updateAutomation.mutate({ id, is_active: !currentValue });
  };

  return (
    <div className="min-h-screen">
      <Header title="Automations" subtitle="Automate your workflow with AI-powered actions" />

      <div className="p-6 space-y-8">
        {/* Active Automations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Active Automations</h2>
              <p className="text-sm text-muted-foreground">Your currently running automation workflows</p>
            </div>
            <Button className="gap-2" onClick={() => setCreateAutomationOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Custom
            </Button>
            <CreateAutomationDialog open={createAutomationOpen} onOpenChange={setCreateAutomationOpen} />
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : automations.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
                No automations created yet. Create your first automation to get started.
              </div>
            ) : (
              automations.map((automation, index) => (
                <div
                  key={automation.id}
                  className="rounded-xl bg-card border border-border p-5 shadow-card animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          automation.is_active ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        {automation.is_active ? (
                          <Play className="h-5 w-5 text-primary" />
                        ) : (
                          <Pause className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{automation.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {triggerLabels[automation.trigger_type] || automation.trigger_type}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                            {actionLabels[automation.action_type] || automation.action_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={automation.is_active || false}
                      onCheckedChange={() => toggleAutomation(automation.id, automation.is_active || false)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Templates */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Automation Templates</h2>
            <p className="text-sm text-muted-foreground">Get started quickly with pre-built workflows</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automationTemplates.map((template, index) => (
              <div
                key={template.id}
                className="group rounded-xl bg-card border border-border p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  {template.popular && (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">Popular</Badge>
                  )}
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setCreateAutomationOpen(true)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
