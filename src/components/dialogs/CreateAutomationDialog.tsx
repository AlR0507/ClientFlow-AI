import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateAutomation } from "@/hooks/useAutomations";
import { useExecuteAutomation } from "@/hooks/useExecuteAutomation";
import { useClients } from "@/hooks/useClients";
import { Mail, Clock, Calendar, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionType = "email" | "meeting" | "ai-summary";

const actionTypes: Array<{
  value: ActionType;
  label: string;
  icon: typeof Mail;
  description: string;
}> = [
  { value: "email", label: "Email", icon: Mail, description: "Send an automated email" },
  { value: "meeting", label: "Meeting Follow-up", icon: Calendar, description: "Send meeting follow-up email" },
  { value: "ai-summary", label: "AI Client Summary", icon: Zap, description: "Generate AI summary for a client" },
];

export function CreateAutomationDialog({ open, onOpenChange }: CreateAutomationDialogProps) {
  const { toast } = useToast();
  const createAutomation = useCreateAutomation();
  const executeAutomation = useExecuteAutomation();
  const { data: clients = [] } = useClients();
  const [actionType, setActionType] = useState<ActionType | "">("");
  
  // Form data for different action types
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // Email fields
    emailMessage: "",
    emailSendDate: "",
    // Meeting follow-up fields
    meetingName: "",
    meetingEmailContent: "",
    // AI Client Summary fields
    selectedClientId: "",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setActionType("");
      setFormData({
        name: "",
        description: "",
        emailMessage: "",
        emailSendDate: "",
        meetingName: "",
        meetingEmailContent: "",
        selectedClientId: "",
      });
    }
  }, [open]);

  const validateForm = (): boolean => {
    if (!formData.name || !actionType) {
      toast({
        title: "Required fields missing",
        description: "Please fill in Automation Name and Action.",
        variant: "destructive",
      });
      return false;
    }

    // Validate action-specific required fields
    switch (actionType) {
      case "email":
        if (!formData.emailMessage || !formData.emailSendDate) {
          toast({
            title: "Required fields missing",
            description: "Please fill in Custom message and Date of sending for Email action.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case "meeting":
        if (!formData.meetingName || !formData.meetingEmailContent) {
          toast({
            title: "Required fields missing",
            description: "Please fill in Meeting name and Email content for Meeting follow-up.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case "ai-summary":
        if (!formData.selectedClientId) {
          toast({
            title: "Required fields missing",
            description: "Please select a client for AI Client Summary.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Build config object based on action type
      const config: Record<string, any> = {};
      
      if (actionType === "email") {
        config.email_message = formData.emailMessage;
        config.email_send_date = formData.emailSendDate;
      } else if (actionType === "meeting") {
        config.meeting_name = formData.meetingName;
        config.email_content = formData.meetingEmailContent;
      } else if (actionType === "ai-summary") {
        config.client_id = formData.selectedClientId;
      }

      const newAutomation = await createAutomation.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        action_type_type: actionType,
        action_type: actionType, // Alias for compatibility
        is_enabled: true,
        is_active: true, // Alias for compatibility
        config: config,
      });

      toast({
        title: "Automation created",
        description: `"${formData.name}" automation has been created and is now active.`,
      });

      // Close the dialog immediately after creating the automation
      onOpenChange(false);

      // If it's an AI summary automation, execute it automatically in the background
      if (actionType === "ai-summary") {
        // Execute in the background without awaiting (non-blocking)
        executeAutomation.mutate(
          { automation: newAutomation },
          {
            onSuccess: () => {
              toast({
                title: "Summary generated",
                description: "AI summary has been generated successfully.",
              });
            },
            onError: (error: any) => {
              console.error("Error executing automation:", error);
              toast({
                title: "Summary generation failed",
                description: "Automation was created but failed to generate summary. You can generate it manually.",
                variant: "destructive",
              });
            },
          }
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive",
      });
    }
  };

  const selectedAction = actionTypes.find(a => a.value === actionType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Automation</DialogTitle>
          <DialogDescription>
            Set up an automated workflow. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Automation Name *</Label>
              <Input
                id="name"
                placeholder="Welcome Email Flow"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Action *</Label>
              <Select
                value={actionType}
                onValueChange={(value) => setActionType(value as ActionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What should happen?" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAction && (
                <p className="text-xs text-muted-foreground mt-1">{selectedAction.description}</p>
              )}
            </div>
          </div>

          {/* Action-specific fields */}
          {actionType && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-medium text-foreground text-sm">Action Configuration</h3>
              
              {/* Email Action */}
              {actionType === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailMessage">Custom message to send *</Label>
                    <Textarea
                      id="emailMessage"
                      placeholder="Write your email message here..."
                      value={formData.emailMessage}
                      onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSendDate">Date of sending *</Label>
                    <Input
                      id="emailSendDate"
                      type="datetime-local"
                      value={formData.emailSendDate}
                      onChange={(e) => setFormData({ ...formData, emailSendDate: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Meeting Follow-up Action */}
              {actionType === "meeting" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingName">Meeting name *</Label>
                    <Input
                      id="meetingName"
                      placeholder="Quarterly Review Meeting"
                      value={formData.meetingName}
                      onChange={(e) => setFormData({ ...formData, meetingName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingEmailContent">Email content *</Label>
                    <Textarea
                      id="meetingEmailContent"
                      placeholder="Write your meeting follow-up email content here..."
                      value={formData.meetingEmailContent}
                      onChange={(e) => setFormData({ ...formData, meetingEmailContent: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* AI Client Summary Action */}
              {actionType === "ai-summary" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedClient">Select Client *</Label>
                    <Select
                      value={formData.selectedClientId}
                      onValueChange={(value) => setFormData({ ...formData, selectedClientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                        ) : (
                          clients.map((client) => {
                            const clientId = client.id || (client as any).client_id;
                            return (
                              <SelectItem key={clientId} value={clientId}>
                                {client.name} {client.company && `- ${client.company}`}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      <Zap className="h-4 w-4 inline mr-2 text-primary" />
                      AI will automatically generate a summary of client interactions, preferences, and next steps.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this automation does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAutomation.isPending}>
              {createAutomation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Automation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
