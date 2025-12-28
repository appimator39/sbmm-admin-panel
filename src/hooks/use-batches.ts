import { useState, useEffect, useCallback } from 'react';

import httpService from 'src/services/httpService';

interface Student {
  _id: string;
}

interface Course {
  _id: string;
}

interface Batch {
  _id: string;
  title: string;
  description: string;
  students: string[];
  courses: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface BatchesResponse {
  statusCode: number;
  message: string;
  data: {
    batches: Batch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AddBatchResponse {
  statusCode: number;
  message: string;
  data: Batch;
}

interface DeleteBatchResponse {
  statusCode: number;
  message: string;
  data: Batch;
}

interface EnrollStudentsResponse {
  statusCode: number;
  message: string;
  data: Batch;
}

interface AssignCoursesResponse {
  statusCode: number;
  message: string;
  data: Batch;
}

interface BulkEnrollResponse {
  statusCode: number;
  message: string;
  data: {
    successful: Array<{
      email: string;
      userId: string;
    }>;
    skipped: Array<{
      email: string;
      reason: string;
    }>;
    failed: Array<{
      email: string;
      reason: string;
    }>;
    batchId: string;
    totalStudentsInBatch: number;
    summary: {
      total: number;
      enrolled: number;
      skipped: number;
      failed: number;
    };
  };
}

interface RemoveStudentResponse {
  statusCode: number;
  message: string;
  data: Batch;
}
interface BulkRemoveResponse {
  statusCode: number;
  message: string;
  data: {
    successful: Array<{
      email: string;
      userId?: string;
    }>;
    skipped: Array<{
      email: string;
      reason: string;
    }>;
    failed: Array<{
      email: string;
      reason: string;
    }>;
    batchId: string;
    totalStudentsInBatch: number;
    summary: {
      total: number;
      removed: number;
      skipped: number;
      failed: number;
    };
  };
}

export const useBatches = (page: number, limit: number) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addBatchLoading, setAddBatchLoading] = useState(false);
  const [addBatchError, setAddBatchError] = useState<string | null>(null);
  const [deleteBatchLoading, setDeleteBatchLoading] = useState(false);
  const [deleteBatchError, setDeleteBatchError] = useState<string | null>(null);

  const fetchBatches = useCallback(
    async (currentPage: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.get<BatchesResponse>(
          `/batch?page=${currentPage + 1}&limit=${limit}`
        );
        setBatches(response.data.data.batches);
        setTotal(response.data.data.total);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch batches');
        setBatches([]);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    fetchBatches();
  }, [page, limit, fetchBatches]);

  const addBatch = async (data: { title: string; description: string }) => {
    setAddBatchLoading(true);
    setAddBatchError(null);
    try {
      const response = await httpService.post<AddBatchResponse>('/batch', data);
      return true;
    } catch (err) {
      setAddBatchError(err.response?.data?.message || 'Failed to add batch');
      return false;
    } finally {
      setAddBatchLoading(false);
    }
  };

  const deleteBatch = async (batchId: string) => {
    setDeleteBatchLoading(true);
    setDeleteBatchError(null);
    try {
      await httpService.delete<DeleteBatchResponse>(`/batch/${batchId}`);
      return true;
    } catch (err) {
      setDeleteBatchError(err.response?.data?.message || 'Failed to delete batch');
      return false;
    } finally {
      setDeleteBatchLoading(false);
    }
  };

  const enrollStudents = async (batchId: string, emails: string[]) => {
    try {
      const response = await httpService.post<BulkEnrollResponse>(
        '/users/admin/bulk-enroll-students',
        {
          emails,
          batchId,
        }
      );

      const { skipped, failed } = response.data.data;

      if (skipped.length > 0) {
        const skippedEmails = skipped
          .filter((skip) => skip.reason === 'Already enrolled in batch')
          .map((skip) => skip.email);

        if (skippedEmails.length > 0) {
          throw new Error(
            `The following students are already enrolled in this batch:\n${skippedEmails.join('\n')}`
          );
        }
      }

      if (failed.length > 0) {
        const failedMessages = failed
          .map((failure) => `${failure.email}: ${failure.reason}`)
          .join('\n');
        throw new Error(`Failed to enroll some students:\n${failedMessages}`);
      }

      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to enroll students');
    }
  };

  const assignCourses = async (batchId: string, courseId: string) => {
    try {
      await httpService.patch<AssignCoursesResponse>(`/batch/${batchId}/assign-courses`, {
        courseId,
      });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to assign course');
    }
  };

  const removeStudent = async (batchId: string, email: string) => {
    try {
      await httpService.delete<RemoveStudentResponse>('/users/admin/remove-student', {
        data: {
          email,
          batchId,
        },
      });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const bulkRemoveStudents = async (
    batchId: string,
    emails: string[]
  ): Promise<BulkRemoveResponse['data']> => {
    try {
      const response = await httpService.post<BulkRemoveResponse>(
        '/users/admin/bulk-remove-students',
        {
          emails,
          batchId,
        }
      );
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to bulk remove students');
    }
  };

  return {
    batches,
    total,
    loading,
    error,
    addBatch,
    addBatchLoading,
    addBatchError,
    deleteBatch,
    deleteBatchLoading,
    deleteBatchError,
    fetchBatches,
    enrollStudents,
    assignCourses,
    removeStudent,
    bulkRemoveStudents,
  };
};
