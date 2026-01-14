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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useClients, type Client } from "@/hooks/useClients";
import { useCreatePrioritization, calculateFinalPriority } from "@/hooks/usePrioritization";
import { analyzeImageWithOpenAI } from "@/lib/openai-pdf-analyzer";
import { Loader2, Search, Building2, Mail, ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PrioritizationAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveDealsOption = "1" | "2" | "3+";
type FrequencyOption = "1-2times" | "3-5times" | "6-9times" | "10+times";
type WhoInitiatedOption = "client" | "you";
type PendingProposalOption = "yes" | "no";

export function PrioritizationAutomationDialog({
  open,
  onOpenChange,
}: PrioritizationAutomationDialogProps) {
  const { toast } = useToast();
  const { data: clients = [], isLoading } = useClients();
  const createPrioritization = useCreatePrioritization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingPDF, setIsAnalyzingPDF] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [activeDeals, setActiveDeals] = useState<ActiveDealsOption | "">("");
  const [interactionFrequency, setInteractionFrequency] = useState<FrequencyOption | "">("");
  const [showOptionalForm, setShowOptionalForm] = useState(false);
  
  // Optional fields
  const [notes, setNotes] = useState("");
  const [whoInitiated, setWhoInitiated] = useState<WhoInitiatedOption | "">("");
  const [pendingProposal, setPendingProposal] = useState<PendingProposalOption | "">("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveDeals("");
      setInteractionFrequency("");
      setSelectedClient(null);
      setShowForm(false);
      setSearchQuery("");
      setShowOptionalForm(false);
      setWhoInitiated("");
      setPendingProposal("");
      setUploadedFile(null);
    }
  }, [open]);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleBackToClientSelection = () => {
    setShowForm(false);
    setShowOptionalForm(false);
    setSelectedClient(null);
    setActiveDeals("");
    setInteractionFrequency("");
    setWhoInitiated("");
    setPendingProposal("");
    setUploadedFile(null);
  };

  const handleContinue = async () => {
    if (!selectedClient) {
      toast({
        title: "Cliente no seleccionado",
        description: "Por favor selecciona un cliente primero.",
        variant: "destructive",
      });
      return;
    }

    if (!activeDeals || !interactionFrequency) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una opción en cada pregunta.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate priority from mandatory questions only
      const calculatedPriority = calculateFinalPriority({
        activeDeals: [activeDeals],
        interactionFrequency: [interactionFrequency],
      });

      // Save prioritization data
      await createPrioritization.mutateAsync({
        client_id: selectedClient.id,
        active_deals: [activeDeals],
        interaction_frequency: [interactionFrequency],
        calculated_priority: calculatedPriority,
      });

      toast({
        title: "Priorización guardada",
        description: `La priorización para ${selectedClient.name} ha sido configurada exitosamente. Prioridad: ${calculatedPriority}.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la priorización",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActiveDealsChange = (value: string) => {
    setActiveDeals(value as ActiveDealsOption);
  };

  const handleFrequencyChange = (value: string) => {
    setInteractionFrequency(value as FrequencyOption);
  };

  const handleWhoInitiatedChange = (value: string) => {
    setWhoInitiated(value as WhoInitiatedOption);
  };

  const handlePendingProposalChange = (value: string) => {
    setPendingProposal(value as PendingProposalOption);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Accept image formats: jpg, jpeg, png
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo inválido",
          description: "Por favor sube solo archivos de imagen (JPG, JPEG o PNG).",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toast({
        title: "Cliente no seleccionado",
        description: "Por favor selecciona un cliente primero.",
        variant: "destructive",
      });
      return;
    }

    if (!activeDeals || !interactionFrequency) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una opción en cada pregunta.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let pdfPriority: "low" | "medium" | "high" | undefined;
      let pdfKeywordsCount: number | undefined;
      let pdfSentiment: "low" | "mid" | "high" | undefined;

      // Analyze image if uploaded
      if (uploadedFile) {
        setIsAnalyzingPDF(true);
        try {
          // analyzeImageWithOpenAI will automatically get the API key from environment
          const analysis = await analyzeImageWithOpenAI(uploadedFile);
          pdfPriority = analysis.priority;
          pdfKeywordsCount = analysis.keywordsCount;
          pdfSentiment = analysis.sentiment;

          toast({
            title: "Imagen analizada",
            description: `Análisis completado: ${analysis.keywordsCount} keywords, sentimiento ${analysis.sentiment}, prioridad ${analysis.priority}.`,
          });
        } catch (imageError: any) {
          console.error("Error analyzing image:", imageError);
          toast({
            title: "Advertencia",
            description: `No se pudo analizar la imagen: ${imageError.message}. Continuando sin análisis de imagen.`,
            variant: "default",
          });
        } finally {
          setIsAnalyzingPDF(false);
        }
      }

      // Calculate final priority with all data
      const calculatedPriority = calculateFinalPriority({
        activeDeals: [activeDeals],
        interactionFrequency: [interactionFrequency],
        whoInitiated: whoInitiated ? [whoInitiated] : undefined,
        pendingProposal: pendingProposal ? [pendingProposal] : undefined,
        pdfPriority,
        pdfKeywordsCount,
        pdfSentiment,
      });

      // Save prioritization data
      await createPrioritization.mutateAsync({
        client_id: selectedClient.id,
        active_deals: [activeDeals],
        interaction_frequency: [interactionFrequency],
        who_initiated: whoInitiated ? [whoInitiated] : undefined,
        pending_proposal: pendingProposal ? [pendingProposal] : undefined,
        pdf_priority: pdfPriority,
        pdf_keywords_count: pdfKeywordsCount,
        pdf_sentiment: pdfSentiment,
        calculated_priority: calculatedPriority,
      });

      toast({
        title: "Priorización guardada",
        description: `La priorización para ${selectedClient.name} ha sido configurada exitosamente. Prioridad final: ${calculatedPriority}.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la priorización",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {showForm ? "Automatizar Priorización" : "Seleccionar Cliente"}
          </DialogTitle>
          <DialogDescription>
            {showForm
              ? `Configura las reglas para automatizar la priorización de ${selectedClient?.name}`
              : "Elige un cliente para automatizar su priorización"}
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          // Client Selection View
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
                  <p className="text-sm">No se encontraron clientes</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
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

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        ) : !showOptionalForm ? (
          // Required Form View
          <div className="space-y-6">
            {/* Selected Client Info */}
            {selectedClient && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {selectedClient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{selectedClient.name}</p>
                    {selectedClient.email && (
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Required Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Required</h3>

              {/* First Question */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  Number of active deals with the client: * 
                </Label>
                <RadioGroup
                  value={activeDeals}
                  onValueChange={handleActiveDealsChange}
                  className="space-y-2 pl-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="deal-1" />
                    <Label
                      htmlFor="deal-1"
                      className="text-sm font-normal cursor-pointer"
                    >
                      1 deal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="deal-2" />
                    <Label
                      htmlFor="deal-2"
                      className="text-sm font-normal cursor-pointer"
                    >
                      2 deals
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3+" id="deal-3+" />
                    <Label
                      htmlFor="deal-3+"
                      className="text-sm font-normal cursor-pointer"
                    >
                      3+ deals
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Second Question */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  Interaction frequency last 14 days? *
                </Label>
                <RadioGroup
                  value={interactionFrequency}
                  onValueChange={handleFrequencyChange}
                  className="space-y-2 pl-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-2times" id="1-2times" />
                    <Label
                      htmlFor="1-2times"
                      className="text-sm font-normal cursor-pointer"
                    >
                      1 - 2 times
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-5times" id="3-5times" />
                    <Label
                      htmlFor="3-5times"
                      className="text-sm font-normal cursor-pointer"
                    >
                      3 - 5 times
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-9times" id="6-9times" />
                    <Label
                      htmlFor="6-9times"
                      className="text-sm font-normal cursor-pointer"
                    >
                      6 - 9 times
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10+times" id="10+times" />
                    <Label
                      htmlFor="10+times"
                      className="text-sm font-normal cursor-pointer"
                    >
                      +10 times
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToClientSelection}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptionalForm(true)}
                disabled={isSubmitting}
              >
                Configuración opcional
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting || createPrioritization.isPending}
              >
                {(isSubmitting || createPrioritization.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Optional Form View
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Client Info */}
            {selectedClient && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {selectedClient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{selectedClient.name}</p>
                    {selectedClient.email && (
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Optional Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">Optional:</h3>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground">
                  Advanced settings.
                </Label>

              {/* Who initiated contact? */}
              <div className="space-y-3 pl-1">
                <Label className="text-sm font-medium text-foreground">
                  Who initiated contact?
                </Label>
                <RadioGroup
                  value={whoInitiated}
                  onValueChange={handleWhoInitiatedChange}
                  className="space-y-2 pl-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client-initiated" />
                    <Label
                      htmlFor="client-initiated"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Client
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="you" id="you-initiated" />
                    <Label
                      htmlFor="you-initiated"
                      className="text-sm font-normal cursor-pointer"
                    >
                      You
                    </Label>
                  </div>
                </RadioGroup>
              </div>

                {/* Pending proposal */}
                <div className="space-y-3 pl-1">
                  <Label className="text-sm font-medium text-foreground">
                    Is there any pending proposal between you and the client? (meeting, call, etc.)
                  </Label>
                  <RadioGroup
                    value={pendingProposal}
                    onValueChange={handlePendingProposalChange}
                    className="space-y-2 pl-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="pending-yes" />
                      <Label
                        htmlFor="pending-yes"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="pending-no" />
                      <Label
                        htmlFor="pending-no"
                        className="text-sm font-normal cursor-pointer"
                      >
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Upload Image */}
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="text-base font-medium text-foreground">
                  Upload image
                </Label>
                <p className="text-xs text-muted-foreground">
                  NOTE: "Upload an image (JPG/PNG) with details about the client or conversation with client."
                </p>
                <div className="space-y-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground flex-1 truncate">
                        {uploadedFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => {
                          setUploadedFile(null);
                          const input = document.getElementById("image-upload") as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptionalForm(false)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isAnalyzingPDF || createPrioritization.isPending}>
                {(isSubmitting || isAnalyzingPDF || createPrioritization.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzingPDF ? "Analizando imagen..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
