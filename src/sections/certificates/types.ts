export interface Certificate {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
  };
  certificateType: 'batch' | 'course';
  excludedUsers: string[];
  batchId?: {
    _id: string;
    title: string;
    description: string;
  };
  batchName?: string;
  issueDate: string;
  issuedByName: string;
  status: 'issued' | 'pending' | 'cancelled';
  description: string;
  downloadCount: number;
  certificateHash: string;
  metadata: {
    totalStudents: number;
    excludedCount: number;
    eligibleCount: number;
    batchRank: string;
    totalModules: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CertificateFormData {
  courseId: string;
  certificateType: 'batch' | 'course';
  batchId?: string;
  issueDate: string;
  issuedByName: string;
  description: string;
  excludedUsers: string[];
}

export interface CertificateResponse {
  statusCode: number;
  message: string;
  data: {
    certificates: Certificate[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalRecords: number;
    };
  };
}

export interface Course {
  _id: string;
  title: string;
  description: string;
}

export interface Batch {
  _id: string;
  title: string;
  description: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  rollNo?: string;
} 