import { useState, useEffect, useCallback } from 'react';

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

interface AddChapterResponse {
  statusCode: number;
  message: string;
  data: Chapter;
}

interface DeleteChapterResponse {
  statusCode: number;
  message: string;
  data: Chapter;
}

interface TogglePublishResponse {
  statusCode: number;
  message: string;
  data: Chapter;
}

interface AddChapterData {
  title: string;
  description: string;
  order: number;
  course: string;
}

interface AddLectureData {
  title: string;
  description: string;
  content: string;
  order: number;
  duration: string;
  isPreview: boolean;
  resources: string[];
  file: File;
}

interface AddLectureResponse {
  statusCode: number;
  message: string;
  data: Lecture;
}

interface DeleteLectureResponse {
  statusCode: number;
  message: string;
  data: Lecture;
}

export const useChapters = (page: number, limit: number) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addChapterLoading, setAddChapterLoading] = useState(false);
  const [addChapterError, setAddChapterError] = useState<string | null>(null);
  const [deleteChapterLoading, setDeleteChapterLoading] = useState(false);
  const [deleteChapterError, setDeleteChapterError] = useState<string | null>(null);
  const [togglePublishLoading, setTogglePublishLoading] = useState(false);
  const [togglePublishError, setTogglePublishError] = useState<string | null>(null);
  const [addLectureLoading, setAddLectureLoading] = useState(false);
  const [addLectureError, setAddLectureError] = useState<string | null>(null);
  const [deleteLectureLoading, setDeleteLectureLoading] = useState(false);
  const [deleteLectureError, setDeleteLectureError] = useState<string | null>(null);

  const fetchChapters = useCallback(
    async (currentPage: number = page) => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.post<ChaptersResponse>('/content/list', {
          page: currentPage + 1,
          limit,
          order: 'asc',
        });
        setChapters(response.data.data.contents);
        setTotal(response.data.data.totalContents);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch chapters');
        setChapters([]);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    fetchChapters();
  }, [page, limit, fetchChapters]);

  const addChapter = async (data: AddChapterData) => {
    setAddChapterLoading(true);
    setAddChapterError(null);
    try {
      await httpService.post<AddChapterResponse>('/content', data);
      return true;
    } catch (err) {
      setAddChapterError(err.response?.data?.message || 'Failed to add chapter');
      return false;
    } finally {
      setAddChapterLoading(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    setDeleteChapterLoading(true);
    setDeleteChapterError(null);
    try {
      await httpService.delete<DeleteChapterResponse>(`/content/${chapterId}`);
      return true;
    } catch (err) {
      setDeleteChapterError(err.response?.data?.message || 'Failed to delete chapter');
      return false;
    } finally {
      setDeleteChapterLoading(false);
    }
  };

  const togglePublish = async (chapterId: string) => {
    setTogglePublishLoading(true);
    setTogglePublishError(null);
    try {
      await httpService.put<TogglePublishResponse>(`/chapters/${chapterId}/toggle-publish`, {});
      return true;
    } catch (err) {
      setTogglePublishError(
        err.response?.data?.message || 'Failed to toggle chapter publish status'
      );
      return false;
    } finally {
      setTogglePublishLoading(false);
    }
  };

  const addLecture = async (formData: FormData, config?: { onUploadProgress: (progressEvent: any) => void }): Promise<boolean> => {
    setAddLectureError(null);
    setAddLectureLoading(true);

    try {
      await httpService.post('/lecture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config
      });

      return true;
    } catch (err: any) {
      setAddLectureError(err.response?.data?.message || 'Failed to add lecture');
      return false;
    } finally {
      setAddLectureLoading(false);
    }
  };

  const deleteLecture = async (lectureId: string) => {
    setDeleteLectureLoading(true);
    setDeleteLectureError(null);
    try {
      await httpService.delete<DeleteLectureResponse>(`/lecture/${lectureId}`);
      return true;
    } catch (err) {
      setDeleteLectureError(err.response?.data?.message || 'Failed to delete lecture');
      return false;
    } finally {
      setDeleteLectureLoading(false);
    }
  };

  return {
    chapters,
    total,
    loading,
    error,
    addChapter,
    addChapterLoading,
    addChapterError,
    deleteChapter,
    deleteChapterLoading,
    deleteChapterError,
    togglePublish,
    togglePublishLoading,
    togglePublishError,
    fetchChapters,
    addLecture,
    addLectureLoading,
    addLectureError,
    deleteLecture,
    deleteLectureLoading,
    deleteLectureError,
  };
};
