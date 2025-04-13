
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Signer {
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
}

interface SignatureStatusProps {
  submissionId: string;
  onComplete?: () => void;
}

export default function SignatureStatus({ submissionId, onComplete }: SignatureStatusProps) {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/docuseal/submissions/${submissionId}`);
        const data = await response.json();
        
        setSigners(data.signers);
        setStatus(data.status);
        
        if (data.status === 'completed' && onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching signature status:', error);
      }
    };

    const interval = setInterval(fetchStatus, 5000);
    fetchStatus();

    return () => clearInterval(interval);
  }, [submissionId, onComplete]);

  const progress = Math.round((signers.filter(s => s.status === 'signed').length / signers.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Signature Status
          <Badge variant={status === 'completed' ? "success" : "secondary"}>
            {status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        
        <div className="space-y-2">
          {signers.map((signer, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
              <div>
                <div>{signer.name}</div>
                <div className="text-sm text-muted-foreground">{signer.email}</div>
              </div>
              <Badge variant={
                signer.status === 'signed' ? "success" :
                signer.status === 'declined' ? "destructive" : "secondary"
              }>
                {signer.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
