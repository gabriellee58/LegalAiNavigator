import { useState, useEffect } from "react";
import { Link } from "wouter";
import { t } from "@/lib/i18n";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { getNotarizationRequirement, getProvinceInfo } from "@/data/notarization-data";

// Interface for document template data that includes jurisdiction information
interface DocumentTemplateWithJurisdiction {
  id: number;
  title: string;
  description: string;
  templateType: string;
  jurisdiction: string | null;
  [key: string]: any;
}

export default function NotarizationGuidance({ 
  template, 
  showTitle = true 
}: { 
  template: DocumentTemplateWithJurisdiction; 
  showTitle?: boolean;
}) {
  // Determine if this document likely requires notarization based on type and jurisdiction
  const [notarizationInfo, setNotarizationInfo] = useState<{
    requiresNotarization: boolean;
    details: string;
    alternativeOptions?: string;
    province?: string;
  } | null>(null);

  useEffect(() => {
    if (!template) return;

    // Extract province from jurisdiction if available
    let province = null;
    if (template.jurisdiction) {
      // Handle different jurisdiction formats
      if (template.jurisdiction.includes("Ontario") || template.jurisdiction === "ON") {
        province = "Ontario";
      } else if (template.jurisdiction.includes("British Columbia") || template.jurisdiction === "BC") {
        province = "British Columbia";
      } else if (template.jurisdiction.includes("Quebec") || template.jurisdiction === "QC") {
        province = "Quebec";
      } else if (template.jurisdiction.includes("Alberta") || template.jurisdiction === "AB") {
        province = "Alberta";
      } else if (template.jurisdiction.includes("Nova Scotia") || template.jurisdiction === "NS") {
        province = "Nova Scotia";
      }
    }

    // Define documentType based on the template type
    let documentType = "";
    if (template.templateType.includes("affidavit") || template.title.toLowerCase().includes("affidavit")) {
      documentType = "Affidavits";
    } else if (template.templateType.includes("power-of-attorney") || template.title.toLowerCase().includes("power of attorney")) {
      documentType = "Powers of Attorney";
    } else if (template.templateType.includes("real-estate") || template.title.toLowerCase().includes("property") || template.title.toLowerCase().includes("deed")) {
      documentType = "Real Estate Documents";
    } else if (template.templateType.includes("will") || template.title.toLowerCase().includes("will")) {
      documentType = "Wills";
    } else if (template.templateType.includes("international") || template.title.toLowerCase().includes("international")) {
      documentType = "International Documents";
    } else if (template.templateType.includes("marriage") || template.title.toLowerCase().includes("marriage")) {
      documentType = "Marriage Contracts";
    }

    // Get notarization requirement if we have province and document type
    if (province && documentType) {
      const requirement = getNotarizationRequirement(province, documentType);
      if (requirement) {
        setNotarizationInfo({
          requiresNotarization: requirement.requiresNotarization,
          details: requirement.details,
          alternativeOptions: requirement.alternativeOptions,
          province
        });
        return;
      }
    }

    // Fallback to general guidance based on document type if province is not determined
    if (documentType) {
      // General guidance for common document types without province-specific info
      const generalGuidance: Record<string, { requiresNotarization: boolean; details: string }> = {
        "Affidavits": {
          requiresNotarization: true,
          details: "Affidavits typically need to be notarized in all Canadian provinces. They must be sworn or affirmed in front of a notary public or commissioner for oaths."
        },
        "Powers of Attorney": {
          requiresNotarization: true,
          details: "Powers of Attorney should be notarized in most Canadian provinces to ensure validity, especially for property matters."
        },
        "Real Estate Documents": {
          requiresNotarization: true,
          details: "Most real estate transactions require notarized documents across Canada."
        },
        "Wills": {
          requiresNotarization: false,
          details: "In many provinces, wills do not require notarization but must be properly witnessed by two witnesses who are not beneficiaries."
        },
        "International Documents": {
          requiresNotarization: true,
          details: "Documents for use outside Canada typically require notarization and may need additional authentication."
        },
        "Marriage Contracts": {
          requiresNotarization: true,
          details: "Marriage contracts often require notarization in Canadian provinces, especially in Quebec."
        }
      };

      if (generalGuidance[documentType]) {
        setNotarizationInfo({
          requiresNotarization: generalGuidance[documentType].requiresNotarization,
          details: generalGuidance[documentType].details
        });
        return;
      }
    }

    // If we haven't been able to determine, show general notice
    setNotarizationInfo({
      requiresNotarization: false,
      details: "We couldn't determine if this document requires notarization. Please check the requirements for your specific jurisdiction and document type."
    });
  }, [template]);

  if (!notarizationInfo) return null;

  return (
    <Card className="mt-6 border">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t("Notarization Guidance")}
          </CardTitle>
          <CardDescription>
            {t("Information about notarization requirements for this document")}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-start gap-4">
          {notarizationInfo.requiresNotarization ? (
            <div className="mt-1 bg-yellow-100 p-2 rounded-full flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          ) : (
            <div className="mt-1 bg-green-100 p-2 rounded-full flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {notarizationInfo.requiresNotarization
                ? t("This document likely requires notarization")
                : t("This document likely does not require notarization")}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {notarizationInfo.province && (
                <Badge variant="outline">
                  {notarizationInfo.province}
                </Badge>
              )}
              <Badge variant={notarizationInfo.requiresNotarization ? "default" : "outline"}>
                {notarizationInfo.requiresNotarization ? t("Notarization Recommended") : t("Notarization Optional")}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">
              {notarizationInfo.details}
            </p>
            {notarizationInfo.alternativeOptions && (
              <div className="p-3 bg-muted rounded-md mb-4">
                <p className="font-medium mb-1">{t("Alternative Options")}:</p>
                <p className="text-sm text-muted-foreground">
                  {notarizationInfo.alternativeOptions}
                </p>
              </div>
            )}

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="notarization-process">
                <AccordionTrigger className="text-sm">
                  {t("How to get this document notarized")}
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                    <li>{t("Print the completed document but DO NOT sign it yet")}</li>
                    <li>{t("Find a notary public in your area")}</li>
                    <li>{t("Bring valid government-issued photo ID to the notary")}</li>
                    <li>{t("Sign the document in front of the notary")}</li>
                    <li>{t("The notary will add their seal/stamp and signature")}</li>
                    <li>{t("Keep a copy of the notarized document for your records")}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between">
        <Button variant="link" asChild>
          <Link href="/notarization-guide">
            <span>{t("View Comprehensive Notarization Guide")}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}