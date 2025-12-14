import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Upload, DollarSign, Calendar, Users, CheckCircle } from "lucide-react";

interface MaterialItem {
  item: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface GeneratedScope {
  scopeSummary: string;
  detailedScope: string;
  opJustification: string;
  materialList: MaterialItem[];
  estimatedCost: number;
  estimatedDurationDays: number;
  tradesRequired: string[];
}

export default function ScopeGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [lossType, setLossType] = useState("water");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [generatedScope, setGeneratedScope] = useState<GeneratedScope | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
    }
  };

  const handleGenerate = async () => {
    if (!projectName || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide project name and description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedScope(null);

    try {
      // Convert images to base64 data URLs for AI analysis
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(dataUrl);
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-scope', {
        body: {
          projectName,
          projectAddress,
          lossType,
          description,
          imageUrls,
        },
      });

      if (error) throw error;

      setGeneratedScope(data);

      // Save to database with user ID from the response
      const { error: dbError } = await supabase.from('ai_scopes').insert({
        project_name: projectName,
        project_address: projectAddress,
        loss_type: lossType as 'water' | 'fire' | 'mold' | 'storm' | 'other',
        description,
        scope_summary: data.scopeSummary,
        detailed_scope: data.detailedScope,
        op_justification: data.opJustification,
        material_list: data.materialList as any,
        estimated_cost: data.estimatedCost,
        estimated_duration_days: data.estimatedDurationDays,
        trades_required: data.tradesRequired,
        created_by: data.userId, // Set from authenticated user
      });

      if (dbError) console.error('Failed to save scope:', dbError);

      toast({
        title: "Scope Generated Successfully",
        description: "AI has analyzed your project and created a detailed scope",
      });

    } catch (error: any) {
      console.error('Error generating scope:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate scope. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            AI Scope Generator
          </CardTitle>
          <CardDescription>
            Upload photos and describe the project to automatically generate detailed reconstruction scope notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g., Residential Water Loss"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lossType">Loss Type *</Label>
              <Select value={lossType} onValueChange={setLossType}>
                <SelectTrigger id="lossType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="mold">Mold</SelectItem>
                  <SelectItem value="storm">Storm</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectAddress">Project Address</Label>
            <Input
              id="projectAddress"
              placeholder="123 Main St, City, State"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the damage, affected areas, and any specific requirements..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Project Photos (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              {imageFiles.length > 0 && (
                <Badge variant="secondary">{imageFiles.length} selected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload damage photos for AI analysis (supports JPG, PNG)
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !projectName || !description}
            className="w-full bg-accent hover:bg-accent/90"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Scope with AI...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Generate Scope
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Scope Display */}
      {generatedScope && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Scope Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{generatedScope.scopeSummary}</p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold font-headline">
                      ${generatedScope.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold font-headline">
                      {generatedScope.estimatedDurationDays} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trades Required</p>
                    <p className="text-2xl font-bold font-headline">
                      {generatedScope.tradesRequired.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Detailed Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-foreground">
                  {generatedScope.detailedScope}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* O&P Justification */}
          <Card className="border-accent/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Overhead & Profit Justification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{generatedScope.opJustification}</p>
            </CardContent>
          </Card>

          {/* Material List */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Material List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedScope.materialList.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{material.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.quantity} {material.unit}
                      </p>
                    </div>
                    <p className="font-semibold">${material.estimatedCost.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total Materials Cost</p>
                <p className="text-xl font-bold text-accent">
                  $
                  {generatedScope.materialList
                    .reduce((sum, m) => sum + m.estimatedCost, 0)
                    .toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trades Required */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Trades Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {generatedScope.tradesRequired.map((trade, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {trade}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
