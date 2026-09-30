export type InquiryStatus = 
  | 'received' 
  | 'in_review' 
  | 'proposal_ready' 
  | 'in_progress' 
  | 'completed';

export interface InquiryAttachment {
  id: string;
  name: string;
  size: string;
}

export interface StatusStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface InquiryMessage {
  id: string;
  sender: 'client' | 'support';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ClientInquiry {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  phone?: string;
  serviceType: string;
  projectDetails: string;
  specificQuestions?: string;
  status: InquiryStatus;
  estimatedResponseTime: string;
  attachments: InquiryAttachment[];
  steps: StatusStep[];
  messages: InquiryMessage[];
}
