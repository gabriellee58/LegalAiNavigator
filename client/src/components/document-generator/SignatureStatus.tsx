
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SignatureStatusProps {
  submissionId: string;
  signers: Array<{
    name: string;
    email: string;
    status: 'pending' | 'signed' | 'declined';
  }>;
}

export default function SignatureStatus({ submissionId, signers }: SignatureStatusProps) {
  const { toast } = useToast();
  const [statusUpdates, setStatusUpdates] = useState(signers);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/docuseal/status/${submissionId}`);
        if (!response.ok) throw new Error('Failed to fetch signature status');
        
        const data = await response.json();
        setStatusUpdates(data.signers);

        if (data.status === 'completed') {
          toast({
            title: "All signatures collected",
            description: "The document has been fully executed.",
          });
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
      }
    };

    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [submissionId, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Signature Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusUpdates.map((signer, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{signer.name}</p>
                <p className="text-sm text-muted-foreground">{signer.email}</p>
              </div>
              <Badge
                variant={
                  signer.status === 'signed' ? 'success' :
                  signer.status === 'declined' ? 'destructive' : 'default'
                }
              >
                {signer.status.charAt(0).toUpperCase() + signer.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
