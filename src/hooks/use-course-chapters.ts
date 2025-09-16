import { useState, useEffect } from 'react';

import httpService from 'src/services/httpService';

interface Lecture {
  _id: string;
  title: string;
  description: string;
  order: number;
  videoUrl: string;
  duration: string;
  isPreview: boolean;
  content: string;
  resources: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

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

interface Chapter {
  _id: string;
  title: string;
  description: string;
  order: number;
  lectures: Lecture[];
  course: Course;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChaptersResponse {
  statusCode: number;
  message: string;
  data: {
    contents: Chapter[];
    totalContents: number;
    totalPages: number;
  };
}

export const useCourseChapters = (courseId: string) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      return;
    }

    const fetchChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.post<ChaptersResponse>('/content/list', {
          page: 1,
          limit: 100, // Get all chapters for the course
          order: 'asc',
        });

        // Filter chapters by course ID
        const courseChapters = response.data.data.contents.filter(
          (chapter) => chapter.course._id === courseId
        );

        setChapters(courseChapters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [courseId]);

  return {
    chapters,
    loading,
    error,
  };
};
