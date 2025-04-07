import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-primary/80" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-4">Page Not Found</h1>
            <p className="text-neutral-600 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. Let's help you find what you need.
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="font-medium text-lg mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="outline" className="w-full justify-start">
                  <span className="material-icons mr-2 text-primary">home</span>
                  Home
                </Button>
              </Link>
              <Link href="/document-generator">
                <Button variant="outline" className="w-full justify-start">
                  <span className="material-icons mr-2 text-primary">description</span>
                  Document Generator
                </Button>
              </Link>
              <Link href="/legal-assistant">
                <Button variant="outline" className="w-full justify-start">
                  <span className="material-icons mr-2 text-primary">smart_toy</span>
                  Legal Assistant
                </Button>
              </Link>
              <Link href="/legal-research">
                <Button variant="outline" className="w-full justify-start">
                  <span className="material-icons mr-2 text-primary">search</span>
                  Legal Research
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Link href="/">
            <Button className="primary-button">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
