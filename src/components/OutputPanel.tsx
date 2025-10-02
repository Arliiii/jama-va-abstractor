import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OutputPanelProps {
  isVisible: boolean;
  onDownload: () => void;
}

export const OutputPanel = ({ isVisible, onDownload }: OutputPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="animate-slide-in-right">
      <Card className="animate-bounce-once">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-success" />
            Abstract Generated
          </CardTitle>
          <CardDescription>
            Your VA-format summary is ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Study Type
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    Randomized Clinical Trial
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Participants
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    N=1,234 patients (18-75 years)
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Primary Outcome
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    Reduction in cardiovascular events
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Key Finding
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    27% relative risk reduction (p&lt;0.001)
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Study Duration:</span> 24 months
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Intervention:</span> Novel cardiovascular therapy vs. placebo
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Follow-up:</span> 12 months post-treatment
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Adverse Events:</span> Similar rates in both groups (p=0.45)
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Conclusion:</span> Significant benefit with acceptable safety profile
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="download" className="space-y-4 mt-4">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-lg p-6">
                  <FileText className="w-12 h-12 mx-auto text-primary mb-3" />
                  <p className="text-sm text-foreground font-medium mb-1">
                    PowerPoint Presentation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    VA-format graphical abstract (12 slides)
                  </p>
                </div>
                
                <Button
                  onClick={onDownload}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PowerPoint
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  File format: .pptx • Size: ~2.5 MB
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
