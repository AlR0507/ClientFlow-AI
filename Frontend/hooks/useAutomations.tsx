import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Automation {
  automation_id: string;
  id?: string; // Alias for automation_id for compatibility
  user_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  action_type_type: string;
  action_type?: string; // Alias for action_type_type for compatibility
  is_enabled: boolean | null;
  is_active?: boolean | null; // Alias for is_enabled for compatibility
  created_at: string;
  updated_at: string;
}

export function useAutomations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["automations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Map database columns to interface with aliases for compatibility
      return (data || []).map((automation: any) => ({
        ...automation,
        id: automation.automation_id,
        action_type: automation.action_type_type,
        is_active: automation.is_enabled,
      })) as Automation[];
    },
    enabled: !!user,
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (automation: Omit<Automation, "automation_id" | "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user?.id) {
        throw new Error("User must be authenticated to create an automation");
      }

      // Map interface fields to database columns
      const dbAutomation: any = {
        name: automation.name,
        description: automation.description,
        trigger_type: automation.trigger_type,
        action_type_type: automation.action_type_type || automation.action_type,
        is_enabled: automation.is_enabled !== undefined ? automation.is_enabled : (automation.is_active !== undefined ? automation.is_active : true),
        user_id: null as any, // El trigger lo asignará automáticamente desde auth.uid()
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("automations")
        .insert(dbAutomation)
        .select()
        .single();
      if (error) throw error;
      
      // Map back to interface format
      return {
        ...data,
        id: data.automation_id,
        action_type: data.action_type_type,
        is_active: data.is_enabled,
      } as Automation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, automation_id, ...updates }: Partial<Automation> & { id?: string; automation_id?: string }) => {
      const targetId = automation_id || id;
      if (!targetId) {
        throw new Error("Automation ID is required");
      }

      // Map interface fields to database columns
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.trigger_type !== undefined) dbUpdates.trigger_type = updates.trigger_type;
      if (updates.action_type_type !== undefined) {
        dbUpdates.action_type_type = updates.action_type_type;
      } else if (updates.action_type !== undefined) {
        dbUpdates.action_type_type = updates.action_type;
      }
      if (updates.is_enabled !== undefined) {
        dbUpdates.is_enabled = updates.is_enabled;
      } else if (updates.is_active !== undefined) {
        dbUpdates.is_enabled = updates.is_active;
      }

      const { data, error } = await supabase
        .from("automations")
        .update(dbUpdates)
        .eq("automation_id", targetId)
        .select()
        .single();
      if (error) throw error;
      
      // Map back to interface format
      return {
        ...data,
        id: data.automation_id,
        action_type: data.action_type_type,
        is_active: data.is_enabled,
      } as Automation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automations")
        .delete()
        .eq("automation_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}
