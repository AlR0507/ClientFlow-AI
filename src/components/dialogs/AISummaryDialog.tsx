import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AISummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: {
    name: string;
    description: string | null;
    config?: {
      client_id?: string;
    };
  } | null;
  summaryData: {
    clientName: string;
    summary: string;
    generatedAt: string;
    clientId?: string;
  } | null;
  clientName?: string;
}

export function AISummaryDialog({
  open,
  onOpenChange,
  automation,
  summaryData,
  clientName,
}: AISummaryDialogProps) {
  if (!automation || !summaryData) return null;

  const displayClientName = summaryData.clientName || clientName || "Unknown Client";
  const generatedDate = summaryData.generatedAt
    ? new Date(summaryData.generatedAt)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{automation.name}</DialogTitle>
              <DialogDescription>
                AI-generated client summary
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Information */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Client</p>
              <p className="text-lg font-semibold text-foreground">{displayClientName}</p>
            </div>
          </div>

          {/* Summary Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Summary</h3>
              {generatedDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Generated {formatDistanceToNow(generatedDate, { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {summaryData.summary}
              </p>
            </div>
          </div>

          {/* Automation Info */}
          {automation.description && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Automation Description</p>
              <p className="text-sm text-foreground">{automation.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
