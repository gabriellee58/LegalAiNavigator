
import express from 'express';
import { storage } from '../storage';
import { DocuSealService } from '../lib/docuSealService';

const router = express.Router();
const docusealService = new DocuSealService(process.env.DOCUSEAL_API_KEY!);

// Webhook handler for signature events
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    switch (event) {
      case 'submission.completed':
        await handleSubmissionCompleted(data);
        break;
      case 'submission.signed':
        await handleSubmissionSigned(data);
        break;
    }
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('DocuSeal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleSubmissionCompleted(data: any) {
  const { submission_id } = data;
  // Update signature status in database
  await storage.updateDigitalSignatureBySubmissionId(
    submission_id,
    { signatureStatus: 'completed', verifiedAt: new Date() }
  );
}

async function handleSubmissionSigned(data: any) {
  const { submission_id, signer_id } = data;
  // Update individual signer status
  await storage.updateDigitalSignatureBySigner(
    submission_id,
    signer_id,
    { signatureStatus: 'signed' }
  );
}

export default router;
