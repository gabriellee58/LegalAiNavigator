import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { queryClient } from '@/lib/queryClient';

export function GoogleAuthDebug() {
  const [status, setStatus] = useState<string>('Idle');
  const [response, setResponse] = useState<string>('');
  const [currentAuth, setCurrentAuth] = useState<any>(null);
  const [testData, setTestData] = useState({
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
  });

  // Check current auth state
  const checkAuthState = () => {
    setStatus('Checking Firebase auth state...');
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentAuth({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        
        if (testData.uid === '') {
          setTestData({
            uid: user.uid || '',
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          });
        }
        
        setStatus('Firebase authenticated');
      } else {
        setCurrentAuth(null);
        setStatus('Not authenticated with Firebase');
      }
    });
  };
  
  // Send auth data to backend
  const testBackendAuth = async () => {
    try {
      setStatus('Sending data to /api/google-auth endpoint...');
      setResponse('');
      
      const response = await fetch('/api/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      setResponse(JSON.stringify(data, null, 2));
      setStatus(`Server responded with status: ${response.status}`);
      
      if (response.ok) {
        // Update query cache if successful
        queryClient.setQueryData(["/api/user"], data);
        setStatus(`Authentication successful! User data cached.`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error?.message || 'Unknown error'}`);
      setResponse(JSON.stringify(error, null, 2));
    }
  };
  
  // Test user endpoint
  const testUserEndpoint = async () => {
    try {
      setStatus('Fetching from /api/user endpoint...');
      setResponse('');
      
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      setStatus(`User endpoint responded with status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(`No response body or unauthorized`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error?.message || 'Unknown error'}`);
      setResponse(JSON.stringify(error, null, 2));
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>Test Google Authentication Flow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Current Status</Label>
          <div className="p-2 bg-primary/10 rounded">{status}</div>
        </div>
        
        <div className="space-y-1">
          <Label>Current Firebase Auth</Label>
          <div className="p-2 bg-primary/10 rounded text-sm font-mono max-h-40 overflow-auto">
            {currentAuth ? JSON.stringify(currentAuth, null, 2) : 'Not authenticated'}
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="uid">Firebase UID</Label>
              <Input 
                id="uid" 
                value={testData.uid} 
                onChange={(e) => setTestData({...testData, uid: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={testData.email} 
                onChange={(e) => setTestData({...testData, email: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={testData.displayName} 
                onChange={(e) => setTestData({...testData, displayName: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="photoURL">Photo URL</Label>
              <Input 
                id="photoURL" 
                value={testData.photoURL} 
                onChange={(e) => setTestData({...testData, photoURL: e.target.value})} 
              />
            </div>
          </div>
        </div>
        
        {response && (
          <div className="space-y-1">
            <Label>Response</Label>
            <pre className="p-2 bg-muted rounded text-sm font-mono max-h-40 overflow-auto">
              {response}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkAuthState}>
            Check Auth State
          </Button>
          <Button onClick={testBackendAuth}>
            Test Backend Auth
          </Button>
        </div>
        <Button variant="secondary" onClick={testUserEndpoint}>
          Test /api/user
        </Button>
      </CardFooter>
    </Card>
  );
}