import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients, type Client } from "@/hooks/useClients";
import { Search, Building2, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SelectClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (client: Client) => void;
}

export function SelectClientDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectClientDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: clients = [], isLoading } = useClients();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (client: Client) => {
    onSelect(client);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
          <DialogDescription>
            Choose a client to automate their prioritization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Clients List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No clients found</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {client.company && (
                          <>
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{client.company}</span>
                          </>
                        )}
                        {client.email && (
                          <>
                            <Mail className="h-3 w-3 ml-2" />
                            <span className="truncate">{client.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

