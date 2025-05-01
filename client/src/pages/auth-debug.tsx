import { useEffect, useState } from "react";
import { GoogleAuthDebug } from "@/components/debug/GoogleAuthDebug";
import { Auth } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AuthDebugPage() {
  const [firebaseImported, setFirebaseImported] = useState<boolean>(false);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Dynamically import Firebase to avoid circular dependencies
    const importFirebase = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        setFirebaseAuth(auth);
        setFirebaseImported(true);
      } catch (error) {
        console.error("Failed to import Firebase:", error);
        toast({
          title: "Firebase Import Error",
          description: "Could not load Firebase authentication. See console for details.",
          variant: "destructive"
        });
      }
    };

    importFirebase();
  }, [toast]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Authentication Debug</h1>
          <p className="text-muted-foreground">
            This page is for debugging and testing the authentication flow in development.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth">Go to Auth Page</Link>
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {firebaseImported ? (
          <GoogleAuthDebug />
        ) : (
          <div className="p-8 bg-muted rounded-lg text-center">
            <p className="text-lg">Loading Firebase authentication...</p>
          </div>
        )}
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Authentication Help</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Debug Process</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                <li>Click "Check Auth State" to see if you're currently authenticated with Firebase</li>
                <li>If authenticated, the form will be pre-filled with your Firebase user data</li>
                <li>Click "Test Backend Auth" to send this data to the server's /api/google-auth endpoint</li>
                <li>If successful, click "Test /api/user" to verify the session was created properly</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Common Issues</h3>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Firebase credentials not configured (check environment variables)</li>
                <li>Domain not authorized in Firebase console</li>
                <li>Session not being created or maintained properly</li>
                <li>CORS issues with API requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}