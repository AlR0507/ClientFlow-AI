import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddDealDialog } from "@/components/dialogs/AddDealDialog";
import { DealDetailDialog } from "@/components/dialogs/DealDetailDialog";
import { useDeals, useUpdateDeal, type Deal } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stageConfig = [
  { id: "New", title: "New", color: "bg-muted-foreground" },
  { id: "Contacted", title: "Contacted", color: "bg-primary" },
  { id: "Follow-up", title: "Follow-up", color: "bg-warning" },
  { id: "Negotiating", title: "Negotiating", color: "bg-success" },
  { id: "Closed", title: "Closed", color: "bg-success" },
];

export default function Pipeline() {
  const [addDealOpen, setAddDealOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("Lead");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const { data: deals = [], isLoading } = useDeals();
  const updateDeal = useUpdateDeal();
  const { toast } = useToast();

  // Find the selected deal from the deals array to ensure it's always up to date
  const selectedDeal = selectedDealId
    ? (deals.find((deal) => deal.id === selectedDealId) as Deal | undefined) || null
    : null;

  const stages = useMemo(() => {
    return stageConfig.map((stage) => ({
      ...stage,
      deals: deals.filter((deal) => deal.stage === stage.id),
    }));
  }, [deals]);

  const totalValue = useMemo(() => {
    return deals.reduce((acc, deal) => acc + (deal.amount || 0), 0);
  }, [deals]);

  const handleAddDeal = (stage: string) => {
    setSelectedStage(stage);
    setAddDealOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
    // Make the dragged element semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedDealId(null);
    setDragOverStageId(null);
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    
    if (!dealId) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === targetStageId) {
      setDragOverStageId(null);
      return;
    }

    try {
      await updateDeal.mutateAsync({
        id: dealId,
        stage: targetStageId,
      });

      toast({
        title: "Deal moved",
        description: `Deal moved to ${targetStageId} stage.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move deal",
        variant: "destructive",
      });
    } finally {
      setDragOverStageId(null);
      setDraggedDealId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Pipeline" subtitle="Visual overview of your sales pipeline" />

      <div className="p-6 space-y-6">
        {/* Pipeline Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
              <p className="text-2xl font-semibold text-foreground">${totalValue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Total Deals</p>
              <p className="text-2xl font-semibold text-foreground">{deals.length}</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => handleAddDeal("Lead")}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
          <AddDealDialog open={addDealOpen} onOpenChange={setAddDealOpen} defaultStage={selectedStage} />
        </div>

        {/* Deal Detail Dialog */}
        <DealDetailDialog
          open={detailDialogOpen}
          onOpenChange={(open) => {
            setDetailDialogOpen(open);
            if (!open) {
              setSelectedDealId(null);
            }
          }}
          deal={selectedDeal}
        />

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <Skeleton className="h-8 w-full mb-3" />
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))
          ) : (
            stages.map((stage, stageIndex) => (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72 animate-slide-up"
                style={{ animationDelay: `${stageIndex * 100}ms` }}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <h3 className="font-medium text-foreground">{stage.title}</h3>
                    <span className="text-sm text-muted-foreground">({stage.deals.length})</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddDeal(stage.id)}>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Stage Deals */}
                <div
                  className={cn(
                    "space-y-3 min-h-[100px] transition-colors rounded-lg p-2",
                    dragOverStageId === stage.id && "bg-primary/5 border-2 border-dashed border-primary"
                  )}
                >
                  {stage.deals.map((deal: any, dealIndex) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "rounded-lg bg-card border border-border p-4 shadow-card hover:shadow-card-hover transition-all cursor-grab active:cursor-grabbing group",
                        draggedDealId === deal.id && "opacity-50 scale-95"
                      )}
                      style={{ animationDelay: `${(stageIndex * 100) + (dealIndex * 50)}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              draggable={false}
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDealId(deal.id);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver más
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-medium text-foreground">{deal.title}</p>
                        {deal.clients && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                              {deal.clients.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {deal.clients.name}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="text-sm font-semibold text-foreground">
                          ${(deal.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Empty state / Add card button */}
                  <button 
                    onClick={() => handleAddDeal(stage.id)}
                    className="w-full p-4 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-sm"
                  >
                    + Add deal
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
