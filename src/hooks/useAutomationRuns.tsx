import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AutomationRun {
  id: string;
  automation_id: string;
  user_id: string;
  automation_status: string;
  started_at: string;
  finished_at: string;
  error_message: string | null;
  result_data: any | null;
}

/**
 * Get the latest successful run for a specific automation
 */
export function useLatestAutomationRun(automationId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["automation-runs", automationId, user?.id],
    queryFn: async () => {
      if (!automationId || !user?.id) {
        console.log("[useLatestAutomationRun] Missing automationId or user:", { automationId, userId: user?.id });
        return null;
      }
      
      console.log("[useLatestAutomationRun] Fetching run for automation:", automationId);
      
      const { data, error } = await ((supabase as any)
        .from("automation_runs")
        .select("*")
        .eq("automation_id", automationId)
        .eq("automation_status", "completed")
        .order("finished_at", { ascending: false })
        .limit(1));

      if (error) {
        console.error("[useLatestAutomationRun] Error fetching automation run:", error);
        // If no runs found, that's okay
        if (error.code === "PGRST116") {
          console.log("[useLatestAutomationRun] No runs found for automation:", automationId);
          return null;
        }
        throw error;
      }

      console.log("[useLatestAutomationRun] Raw data from query:", data);

      // Handle both single() and array responses
      const runData = Array.isArray(data) ? data[0] : data;
      
      if (!runData) {
        console.log("[useLatestAutomationRun] No run data found");
        return null;
      }
      
      console.log("[useLatestAutomationRun] Found run:", {
        id: runData.id,
        automation_id: runData.automation_id,
        status: runData.automation_status,
        resultDataType: typeof runData.result_data,
        hasResultData: !!runData.result_data,
      });
      
      // Parse result_data if it's a string
      if (runData.result_data && typeof runData.result_data === 'string') {
        try {
          runData.result_data = JSON.parse(runData.result_data);
          console.log("[useLatestAutomationRun] Parsed result_data:", runData.result_data);
        } catch (e) {
          console.error("[useLatestAutomationRun] Error parsing result_data:", e);
        }
      } else if (runData.result_data && typeof runData.result_data === 'object') {
        console.log("[useLatestAutomationRun] result_data is already an object:", runData.result_data);
      }
      
      return runData as AutomationRun | null;
    },
    enabled: !!automationId && !!user,
  });
}

/**
 * Get all runs for a specific automation
 */
export function useAutomationRuns(automationId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["automation-runs-list", automationId, user?.id],
    queryFn: async () => {
      if (!automationId || !user?.id) return [];
      
      const { data, error } = await ((supabase as any)
        .from("automation_runs")
        .select("*")
        .eq("automation_id", automationId)
        .order("finished_at", { ascending: false })
        .limit(10));

      if (error) throw error;
      return (data || []) as AutomationRun[];
    },
    enabled: !!automationId && !!user,
  });
}
