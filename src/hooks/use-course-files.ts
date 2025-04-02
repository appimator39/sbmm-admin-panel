import { useState, useCallback } from 'react';
import httpService from 'src/services/httpService';

export interface CourseFile {
  _id: string;
  title: string;
  description: string;
  fileLink: string;
  isCommon: boolean;
  courseId: {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    startDate: string;
    endDate: string;
    status: string;
    price: number;
    duration: string;
    thumbnail: string;
    category: string;
    tags: string[];
    ratings: number;
    language: string;
    isPublished: boolean;
    isFree: boolean;
    totalSales: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface CourseFilesResponse {
  statusCode: number;
  message: string;
  data: {
    files: CourseFile[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useCourseFiles = (page: number = 0, limit: number = 25) => {
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseFiles = useCallback(
    async (courseId: string, currentPage: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.get<CourseFilesResponse>(
          `/course-files/by-course/${courseId}?page=${currentPage + 1}&limit=${limit}`
        );
        setFiles(response.data.data.files);
        setTotal(response.data.data.pagination.total);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch course files');
        setFiles([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  return {
    files,
    total,
    loading,
    error,
    fetchCourseFiles,
  };
}; 