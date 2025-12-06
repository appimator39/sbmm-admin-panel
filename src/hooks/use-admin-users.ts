import { useState, useEffect, useCallback, useRef } from 'react';

import httpService from 'src/services/httpService';

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionCatalogItem {
  key: string;
  module: string;
  label: string;
}

interface AdminUsersResponse {
  statusCode: number;
  message: string;
  data: {
    items: AdminUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateAdminUserResponse {
  statusCode: number;
  message: string;
  data: AdminUser;
}

interface UpdatePermissionsResponse {
  statusCode: number;
  message: string;
  data: AdminUser;
}

interface PermissionsCatalogResponse {
  statusCode: number;
  message: string;
  data: {
    permissions: string[];
    catalog: PermissionCatalogItem[];
  };
}

export const useAdminUsers = (initialPage: number = 0, initialLimit: number = 25) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Create loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Update loading states
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete loading states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Track previous params to prevent unnecessary fetches
  const prevParams = useRef<string>('');

  const fetchAdminUsers = useCallback(
    async (pageNum?: number, limitNum?: number) => {
      const currentPage = pageNum ?? page;
      const currentLimit = limitNum ?? limit;

      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: (currentPage + 1).toString(), // API uses 1-based pagination
          limit: currentLimit.toString(),
        });

        const response = await httpService.get<AdminUsersResponse>(
          `/admin-permissions/admin-users?${queryParams.toString()}`
        );

        setAdminUsers(response.data.data.items);
        setTotal(response.data.data.total);
        setTotalPages(response.data.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch admin users');
        setAdminUsers([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const fetchPermissionsCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await httpService.get<PermissionsCatalogResponse>('/auth/all-permissions');
      setCatalog(response.data.data.catalog);
      return response.data.data.catalog;
    } catch (err: any) {
      // Try alternate endpoint
      if (err.response?.status === 404) {
        const alt = await httpService.get<PermissionsCatalogResponse>('/api/auth/all-permissions');
        setCatalog(alt.data.data.catalog);
        return alt.data.data.catalog;
      }
      throw err;
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const createAdminUser = async (data: {
    email: string;
    password: string;
    permissions?: string[];
  }): Promise<AdminUser> => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const response = await httpService.post<CreateAdminUserResponse>(
        '/admin-permissions/admin-users',
        data
      );
      const newUser = response.data.data;
      setAdminUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create admin user';
      setCreateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const updateAdminPermissions = async (
    userId: string,
    permissions: string[]
  ): Promise<AdminUser> => {
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const response = await httpService.put<UpdatePermissionsResponse>(
        `/admin-permissions/admin-users/${userId}/permissions`,
        { permissions }
      );
      const updatedUser = response.data.data;
      setAdminUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, permissions } : user))
      );
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update permissions';
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteAdminUser = async (userId: string): Promise<void> => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await httpService.delete(`/admin-permissions/admin-users/${userId}`);
      setAdminUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete admin user';
      setDeleteError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Load admin users when page/limit changes
  useEffect(() => {
    const currentParams = `${page}-${limit}`;
    if (currentParams !== prevParams.current) {
      prevParams.current = currentParams;
      fetchAdminUsers(page, limit);
    }
  }, [page, limit, fetchAdminUsers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when limit changes
  };

  return {
    adminUsers,
    loading,
    error,
    catalog,
    catalogLoading,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    // Pagination
    page,
    limit,
    total,
    totalPages,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    // Actions
    fetchAdminUsers,
    fetchPermissionsCatalog,
    createAdminUser,
    updateAdminPermissions,
    deleteAdminUser,
  };
};
