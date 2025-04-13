
import axios from 'axios';

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'https://api.docuseal.com/v1';

export class DocuSealService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createSubmission(templateId: string, signers: Array<{ name: string, email: string, role?: string }>) {
    try {
      const response = await axios.post(
        `${DOCUSEAL_API_URL}/submissions`, 
        { template_id: templateId, signers },
        { headers: { 'X-Api-Key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      console.error('DocuSeal submission creation error:', error);
      throw error;
    }
  }

  async getSubmission(submissionId: string) {
    try {
      const response = await axios.get(
        `${DOCUSEAL_API_URL}/submissions/${submissionId}`,
        { headers: { 'X-Api-Key': this.apiKey } }
      );
      return response.data;
    } catch (error) {
      console.error('DocuSeal submission retrieval error:', error);
      throw error;
    }
  }
}
