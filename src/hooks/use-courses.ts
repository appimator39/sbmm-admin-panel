import { useState, useEffect, useCallback } from 'react';

import httpService from 'src/services/httpService';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  estimatedPrice: number;
  duration: number;
  thumbnail: string;
  instructor: string;
  students: string[];
  reviews: string[];
  category: string[];
  content: string[];
  tags: string[];
  ratings: number;
  language: string;
  isPublished: boolean;
  isFree: boolean;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CoursesResponse {
  statusCode: number;
  message: string;
  data: {
    courses: Course[];
    totalCourses: number;
    totalPages: number;
  };
}

interface AddCourseResponse {
  statusCode: number;
  message: string;
  data: Course;
}

interface DeleteCourseResponse {
  statusCode: number;
  message: string;
  data: Course;
}

interface TogglePublishResponse {
  statusCode: number;
  message: string;
  data: Course;
}

interface SearchCoursesResponse {
  statusCode: number;
  message: string;
  data: {
    courses: Course[];
  };
}

interface AddCourseData {
  title: string;
  description: string;
  thumbnail: string;
  category: string[];
  tags: string[];
  isPublished: boolean;
  isFree: boolean;
}

export const useCourses = (page: number, limit: number) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState<string | null>(null);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(false);
  const [deleteCourseError, setDeleteCourseError] = useState<string | null>(null);
  const [togglePublishLoading, setTogglePublishLoading] = useState(false);
  const [togglePublishError, setTogglePublishError] = useState<string | null>(null);

  const fetchCourses = useCallback(
    async (currentPage: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.post<CoursesResponse>('/courses/list', {
          page: currentPage + 1,
          limit,
          order: 'asc',
        });
        setCourses(response.data.data.courses);
        setTotal(response.data.data.totalCourses);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    fetchCourses();
  }, [page, limit, fetchCourses]);

  const addCourse = async (data: AddCourseData) => {
    setAddCourseLoading(true);
    setAddCourseError(null);
    try {
      await httpService.post<AddCourseResponse>('/courses', data);
      return true;
    } catch (err) {
      setAddCourseError(err.response?.data?.message || 'Failed to add course');
      return false;
    } finally {
      setAddCourseLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    setDeleteCourseLoading(true);
    setDeleteCourseError(null);
    try {
      await httpService.delete<DeleteCourseResponse>(`/courses/${courseId}`);
      return true;
    } catch (err) {
      setDeleteCourseError(err.response?.data?.message || 'Failed to delete course');
      return false;
    } finally {
      setDeleteCourseLoading(false);
    }
  };

  const togglePublish = async (courseId: string) => {
    setTogglePublishLoading(true);
    setTogglePublishError(null);
    try {
      await httpService.put<TogglePublishResponse>(`/courses/${courseId}/toggle-publish`, {});
      return true;
    } catch (err) {
      setTogglePublishError(
        err.response?.data?.message || 'Failed to toggle course publish status'
      );
      return false;
    } finally {
      setTogglePublishLoading(false);
    }
  };

  const searchCourses = async (query: string) => {
    try {
      const response = await httpService.get<SearchCoursesResponse>(`/course/search?q=${query}`);
      return response.data.data.courses;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to search courses');
    }
  };

  return {
    courses,
    total,
    loading,
    error,
    addCourse,
    addCourseLoading,
    addCourseError,
    deleteCourse,
    deleteCourseLoading,
    deleteCourseError,
    togglePublish,
    togglePublishLoading,
    togglePublishError,
    fetchCourses,
    searchCourses,
  };
};
