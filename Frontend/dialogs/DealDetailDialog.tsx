import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDeleteDeal, type Deal } from "@/hooks/useDeals";
import { EditDealDialog } from "./EditDealDialog";
import { format } from "date-fns";

interface DealDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

export function DealDetailDialog({
  open,
  onOpenChange,
  deal,
}: DealDetailDialogProps) {
  const { toast } = useToast();
  const deleteDeal = useDeleteDeal();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!deal) return null;

  const dealClient = (deal as any).clients;

  const handleDelete = async () => {
    try {
      await deleteDeal.mutateAsync(deal.id);
      toast({
        title: "Deal deleted",
        description: `${deal.title} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete deal",
        variant: "destructive",
      });
    }
  };

  const stageColors: Record<string, string> = {
    New: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/50",
    Contacted: "bg-primary/10 text-primary border-primary/50",
    "Follow-up": "bg-warning/10 text-warning border-warning/50",
    Negotiating: "bg-success/10 text-success border-success/50",
    Closed: "bg-success/10 text-success border-success/50",
  };

  const priorityColors: Record<string, string> = {
    high: "border-destructive/50 text-destructive bg-destructive/10",
    medium: "border-warning/50 text-warning bg-warning/10",
    low: "border-muted-foreground/50 text-muted-foreground",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{deal.title}</DialogTitle>
            <DialogDescription>
              Deal details and information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Basic Information</h3>
              <div className="grid gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-foreground">
                      ${(deal.amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {dealClient && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium text-foreground">
                        {dealClient.name || "—"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize mt-1",
                        stageColors[deal.stage] || stageColors.New
                      )}
                    >
                      {deal.stage}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize mt-1",
                        priorityColors[deal.priority || "medium"] || priorityColors.medium
                      )}
                    >
                      {deal.priority || "medium"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(deal.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Deal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <EditDealDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        deal={deal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{deal.title}</strong> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDeal.isPending}
            >
              {deleteDeal.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

