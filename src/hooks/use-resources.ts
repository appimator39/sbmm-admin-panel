import { useState, useCallback } from 'react';
import httpService from 'src/services/httpService';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

interface ResourcesResponse {
  statusCode: number;
  message: string;
  data: Resource[];
}

export function useResources(page: number, rowsPerPage: number) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addResourceLoading, setAddResourceLoading] = useState(false);
  const [addResourceError, setAddResourceError] = useState<string | null>(null);
  const [deleteResourceLoading, setDeleteResourceLoading] = useState(false);
  const [deleteResourceError, setDeleteResourceError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpService.get<ResourcesResponse>('/resources');
      if (response.data.statusCode === 200) {
        setResources(response.data.data);
        setTotal(response.data.data.length);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, []);

  const addResource = useCallback(async (data: {
    title: string;
    description: string;
    fileType: string;
    file: File;
    batchIds: string[];
  }) => {
    setAddResourceLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('createResourceDto', JSON.stringify({
        title: data.title,
        description: data.description,
        fileType: data.fileType,
        batchIds: data.batchIds,
      }));

      await httpService.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchResources();
      return true;
    } catch (err) {
      setAddResourceError(err instanceof Error ? err.message : 'Failed to add resource');
      return false;
    } finally {
      setAddResourceLoading(false);
    }
  }, [fetchResources]);

  const deleteResource = useCallback(async (resourceId: string) => {
    setDeleteResourceLoading(true);
    try {
      await httpService.delete(`/resources/${resourceId}`);
      await fetchResources();
      return true;
    } catch (err) {
      setDeleteResourceError(err instanceof Error ? err.message : 'Failed to delete resource');
      return false;
    } finally {
      setDeleteResourceLoading(false);
    }
  }, [fetchResources]);

  return {
    resources,
    total,
    loading,
    error,
    addResource,
    addResourceLoading,
    addResourceError,
    deleteResource,
    deleteResourceLoading,
    deleteResourceError,
    fetchResources,
  };
} 