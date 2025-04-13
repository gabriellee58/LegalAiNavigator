import { useState, useMemo } from "react";
import { t } from "@/lib/i18n";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, AlertTriangle, Download, ExternalLink } from "lucide-react";
import { documentTypes, notarizationData, getNotarizationRequirement, getProvinceInfo } from "@/data/notarization-data";
import MainLayout from "@/components/layout/MainLayout";

export default function NotarizationGuidePage() {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  
  const provinceInfo = useMemo(() => {
    return getProvinceInfo(selectedProvince);
  }, [selectedProvince]);
  
  const requirement = useMemo(() => {
    if (!selectedProvince || !selectedDocumentType) return undefined;
    return getNotarizationRequirement(selectedProvince, selectedDocumentType);
  }, [selectedProvince, selectedDocumentType]);

  const handleDownloadChecklist = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just show an alert
    alert(t("The PDF checklist would download here in the production version."));
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("Notarization Guide")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("Learn about document notarization requirements across Canada, find out if your document needs to be notarized, and get guidance on completing the notarization process.")}
          </p>
        </div>

        {/* Top section with search tools */}
        <Card className="mb-8 border bg-card">
          <CardHeader>
            <CardTitle>{t("Document Notarization Checker")}</CardTitle>
            <CardDescription>
              {t("Select your province and document type to check if notarization is required")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t("Province")}</label>
                <Select onValueChange={setSelectedProvince} value={selectedProvince}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("Select a province")} />
                  </SelectTrigger>
                  <SelectContent>
                    {notarizationData.map((province) => (
                      <SelectItem key={province.province} value={province.province}>
                        {province.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("Document Type")}</label>
                <Select 
                  onValueChange={setSelectedDocumentType} 
                  value={selectedDocumentType}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("Select a document type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {requirement && (
              <div className="mt-6 p-4 rounded-lg border">
                <div className="flex items-start space-x-4">
                  {requirement.requiresNotarization ? (
                    <div className="mt-1 bg-yellow-100 p-2 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="mt-1 bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {requirement.requiresNotarization
                        ? t("Notarization Required")
                        : t("Notarization Not Required")}
                    </h3>
                    <p className="text-muted-foreground mb-3">{requirement.details}</p>
                    {requirement.alternativeOptions && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>{t("Alternative Options")}</AlertTitle>
                        <AlertDescription>
                          {requirement.alternativeOptions}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provincial information section */}
        {provinceInfo && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">{t("Notarization in")} {provinceInfo.province}</h2>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
                <TabsTrigger value="requirements">{t("Requirements")}</TabsTrigger>
                <TabsTrigger value="documents">{t("Document Types")}</TabsTrigger>
                <TabsTrigger value="resources">{t("Resources")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Overview")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{provinceInfo.overview}</p>
                    
                    <h3 className="font-semibold mb-2">{t("Who can notarize documents")}</h3>
                    <ul className="list-disc pl-5 mb-4">
                      {provinceInfo.whoCanNotarize.map((person, index) => (
                        <li key={index} className="mb-1">{person}</li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{t("Typical Cost")}</h3>
                        <p>{provinceInfo.typicalCost}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{t("Online Notarization")}</h3>
                        <div className="flex items-center mb-2">
                          <Badge variant={provinceInfo.onlineNotarizationAllowed ? "success" : "destructive"}>
                            {provinceInfo.onlineNotarizationAllowed ? t("Allowed") : t("Not Allowed")}
                          </Badge>
                        </div>
                        {provinceInfo.onlineNotarizationDetails && (
                          <p className="text-sm">{provinceInfo.onlineNotarizationDetails}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requirements">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Common Requirements")}</CardTitle>
                    <CardDescription>
                      {t("What you'll need when getting a document notarized in")} {provinceInfo.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {provinceInfo.commonRequirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Document Requirements")}</CardTitle>
                    <CardDescription>
                      {t("Notarization requirements for common document types in")} {provinceInfo.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Document Type")}</TableHead>
                          <TableHead>{t("Notarization Status")}</TableHead>
                          <TableHead>{t("Details")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {provinceInfo.documentRequirements.map((req) => (
                          <TableRow key={req.documentType}>
                            <TableCell className="font-medium">{t(req.documentType)}</TableCell>
                            <TableCell>
                              <Badge variant={req.requiresNotarization ? "default" : "outline"}>
                                {req.requiresNotarization ? t("Required") : t("Not Required")}
                              </Badge>
                            </TableCell>
                            <TableCell>{req.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Useful Resources")}</CardTitle>
                    <CardDescription>
                      {t("Official links and resources for notarization in")} {provinceInfo.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {provinceInfo.usefulLinks.map((link, index) => (
                        <li key={index} className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("General Notarization Information")}</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is-notarization">
              <AccordionTrigger>
                {t("What is notarization?")}
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  {t("Notarization is the official process of having a document certified by a notary public. The notary verifies the identity of the signers, confirms they signed willingly, and attaches their official seal or stamp to the document. This adds a layer of verification to prevent fraud and ensure the document is legally recognized.")}
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="why-notarize">
              <AccordionTrigger>
                {t("Why notarize a document?")}
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  {t("Documents are notarized to:")}
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>{t("Deter fraud by verifying the signer's identity")}</li>
                  <li>{t("Ensure the signer is acting willingly, not under duress")}</li>
                  <li>{t("Make the document legally recognized in courts and government offices")}</li>
                  <li>{t("Enable the document to be used in international contexts (with additional authentication)")}</li>
                  <li>{t("Provide evidence that the document was signed on a specific date")}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="notarization-process">
              <AccordionTrigger>
                {t("The notarization process")}
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <span className="font-semibold">{t("Preparation")}</span>: {t("Ensure your document is complete but unsigned. Bring valid identification.")}
                  </li>
                  <li>
                    <span className="font-semibold">{t("Identity Verification")}</span>: {t("The notary will check your ID to verify your identity.")}
                  </li>
                  <li>
                    <span className="font-semibold">{t("Signing")}</span>: {t("You will sign the document in front of the notary.")}
                  </li>
                  <li>
                    <span className="font-semibold">{t("Oath or Acknowledgment")}</span>: {t("Depending on the document, you may need to swear an oath or acknowledge your signature.")}
                  </li>
                  <li>
                    <span className="font-semibold">{t("Notary Certification")}</span>: {t("The notary adds their seal, signature, and commission information.")}
                  </li>
                  <li>
                    <span className="font-semibold">{t("Payment")}</span>: {t("Pay the notary's fee for their services.")}
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="remote-notarization">
              <AccordionTrigger>
                {t("Remote (online) notarization")}
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-3">
                  {t("Remote or online notarization allows documents to be notarized over video conference rather than in person. This service has become more widely available in Canada, particularly after COVID-19, but regulations vary by province.")}
                </p>
                
                <h4 className="font-semibold mb-2">{t("Key requirements for remote notarization:")}</h4>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>{t("The notary must be licensed in the province where you're located")}</li>
                  <li>{t("You must show valid ID via video (sometimes with enhanced verification)")}</li>
                  <li>{t("The video session must typically be recorded and stored")}</li>
                  <li>{t("Documents must be transmitted securely")}</li>
                  <li>{t("Digital signatures and seals must be used")}</li>
                </ul>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>{t("Important Note")}</AlertTitle>
                  <AlertDescription>
                    {t("Not all documents are eligible for remote notarization, and not all receiving institutions accept remotely notarized documents. Always confirm acceptance before proceeding.")}
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="international-documents">
              <AccordionTrigger>
                {t("International documents and authentication")}
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-3">
                  {t("Documents intended for use in another country often require additional steps beyond notarization:")}
                </p>
                
                <h4 className="font-semibold mb-2">{t("Authentication and Legalization")}</h4>
                <p className="mb-3">
                  {t("For countries that are not part of the Hague Convention, documents typically need:")}
                </p>
                <ol className="list-decimal pl-5 mb-3 space-y-1">
                  <li>{t("Notarization by a notary public")}</li>
                  <li>{t("Authentication by Global Affairs Canada")}</li>
                  <li>{t("Legalization by the embassy or consulate of the destination country")}</li>
                </ol>
                
                <h4 className="font-semibold mb-2">{t("Apostille")}</h4>
                <p>
                  {t("Canada is not a signatory to the Hague Apostille Convention, so Canadian documents cannot receive an apostille. However, as of January 11, 2024, Canada is in the process of implementing the Apostille Convention, which will simplify this process in the future.")}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">{t("Notarization Checklist")}</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                {t("Printable Notarization Preparation Checklist")}
              </CardTitle>
              <CardDescription>
                {t("Use this checklist to prepare for your notarization appointment")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">{t("Before Your Appointment")}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Verify if your document actually needs notarization")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Complete the document but DO NOT sign it")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Ensure all information in the document is correct")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Make an appointment with a notary public")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Ask the notary about their fees")}</span>
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">{t("What to Bring")}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Government-issued photo ID (passport, driver's license)")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Secondary ID (if required in your province)")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("The unsigned document(s) to be notarized")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Any supporting documents that may be required")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Payment for the notary's services")}</span>
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">{t("After Notarization")}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Check that all pages have been properly notarized")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Verify the notary's stamp and signature are present")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Make copies of the notarized document for your records")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 border rounded flex items-center justify-center flex-shrink-0 mt-0.5"></div>
                    <span>{t("Submit the document to the appropriate institution or authority")}</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button variant="outline" onClick={handleDownloadChecklist}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("Download Printable Checklist (PDF)")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}