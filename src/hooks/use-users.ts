import { useState, useEffect, useRef } from 'react';

import httpService from 'src/services/httpService';
import { getRandomString } from 'src/utils/random-string';

interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
  isVerified: boolean;
  idVerified: boolean;
  isAccountActive: boolean;
  avatar: string;
  batches: { title: string }[];
  status: string;
  createdAt: string;
  updatedAt: string;
  fatherName: string;
  gender: string;
  phoneNumber: string;
  whatsapp: string;
  rollNo: string;
  facebookProfileUrl: string;
  address: string;
  hardwareIdWindows: string | null;
  hardwareIdAndroid: string | null;
  hardwareIdMac: string | null;
  hardwareIdIOS: string | null;
  cnicBackImage: string | null;
  cnicFrontImage: string | null;
  backCNICURL: string | null;
  frontCNICURL: string | null;
  permissions?: string[];
}

interface UsersResponse {
  statusCode: number;
  message: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface SearchUsersResponse {
  statusCode: number;
  message: string;
  data: {
    users: User[];
  };
}

interface PermissionsCatalogResponse {
  statusCode: number;
  message: string;
  data: {
    permissions: string[];
    catalog: { key: string; module: string; label: string }[];
  };
}

interface AssignRevokeResponse {
  statusCode: number;
  message: string;
  data: { userId: string; permissions: string[] };
}

export const useUsers = (
  page: number = 0,
  limit: number = 25,
  batchIds: string[] = [],
  noBatchOnly: boolean = false
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [blockUserLoading, setBlockUserLoading] = useState(false);
  const [blockUserError, setBlockUserError] = useState<string | null>(null);
  const [resetHardwareLoading, setResetHardwareLoading] = useState(false);
  const [resetHardwareError, setResetHardwareError] = useState<string | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  // Use refs to track previous values and prevent infinite loops
  const prevParams = useRef<string>('');

  const loadUsers = async (
    pageNum: number,
    limitNum: number,
    batchIdsArr: string[],
    noBatch: boolean
  ) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: (pageNum + 1).toString(),
        limit: limitNum.toString(),
      });
      if (!noBatch) {
        batchIdsArr.forEach((id) => {
          queryParams.append('batchIds', id);
        });
      }

      const endpoint = noBatch
        ? `/users/admin/users-without-batch?${queryParams.toString()}`
        : `/users/admin/users?${queryParams.toString()}`;

      const response = await httpService.get<UsersResponse>(endpoint);
      setUsers(response.data.data.users);
      setTotal(response.data.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect with proper dependency tracking
  useEffect(() => {
    // Create a string representation of the current parameters
    const currentParams = `${page}-${limit}-${JSON.stringify(batchIds)}-${noBatchOnly}`;

    // Only fetch if parameters have actually changed
    if (currentParams !== prevParams.current) {
      prevParams.current = currentParams;
      loadUsers(page, limit, batchIds, noBatchOnly);
    }
  }, [page, limit, batchIds, noBatchOnly]);

  const fetchUsers = async (
    currentPage?: number,
    currentBatchIds?: string[],
    currentNoBatchOnly?: boolean
  ) => {
    await loadUsers(
      currentPage ?? page,
      limit,
      currentBatchIds ?? batchIds,
      currentNoBatchOnly ?? noBatchOnly
    );
  };

  const addUser = async (data: { name: string; email: string }) => {
    setAddUserLoading(true);
    setAddUserError(null);
    const password = getRandomString(10);
    try {
      const response = await httpService.post('/auth/signup', { ...data, password });
      const newUser = (response.data as { data: User }).data;
      setUsers((prevUsers) => [...prevUsers, newUser]);
    } catch (err) {
      setAddUserError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const blockUser = async (userId: string) => {
    setBlockUserLoading(true);
    setBlockUserError(null);
    try {
      await httpService.patch(`/users/block/${userId}`, {});
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isAccountActive: false, status: 'Blocked' } : user
        )
      );
    } catch (err) {
      setBlockUserError(err.response?.data?.message || 'Failed to block user');
    } finally {
      setBlockUserLoading(false);
    }
  };

  const unblockUser = async (userId: string) => {
    setBlockUserLoading(true);
    setBlockUserError(null);
    try {
      await httpService.patch(`/users/unblock/${userId}`, {});
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isAccountActive: true, status: 'Active' } : user
        )
      );
    } catch (err) {
      setBlockUserError(err.response?.data?.message || 'Failed to block user');
    } finally {
      setBlockUserLoading(false);
    }
  };

  const resetHardwareIds = async (userId: string, data: any) => {
    setResetHardwareLoading(true);
    setResetHardwareError(null);
    try {
      await httpService.patch(`/users/reset-hardware-ids/${userId}`, data);
    } catch (err) {
      setResetHardwareError(err.response?.data?.message || 'Failed to reset hardware IDs');
    } finally {
      setResetHardwareLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeleteUserLoading(true);
    setDeleteUserError(null);
    try {
      await httpService.delete(`/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      setDeleteUserError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const response = await httpService.get<SearchUsersResponse>(
        `/users/admin/search?email=${encodeURIComponent(query)}`
      );
      return response.data.data.users;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to search users');
    }
  };

  const findStudentByEmail = async (email: string) => {
    try {
      const response = await httpService.get<{ data: User }>(
        `/users/admin/find-student?email=${encodeURIComponent(email)}`
      );
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to find student');
    }
  };

  const toggleIdVerification = async (userId: string) => {
    try {
      await httpService.patch(`/users/admin/toggle-id-verification/${userId}`, {});
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isVerified: !user.isVerified } : user
        )
      );
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to toggle ID verification');
    }
  };

  const updateUser = async (userId: string, data: any) => {
    try {
      await httpService.put(`/users/update/${userId}`, data);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, ...data } : user))
      );
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const fetchPermissionsCatalog = async () => {
    try {
      const response = await httpService.get<PermissionsCatalogResponse>('/auth/all-permissions');
      return response.data.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const alt = await httpService.get<PermissionsCatalogResponse>('/api/auth/all-permissions');
        return alt.data.data;
      }
      throw err;
    }
  };

  const assignPermissions = async (
    userId: string,
    permissions: string[],
    role?: 'admin' | 'instructor' | 'user'
  ) => {
    let response;
    try {
      response = await httpService.patch<AssignRevokeResponse>(
        `/users/super-admin/assign-permissions/${userId}`,
        { permissions, role }
      );
    } catch (err) {
      if (err.response?.status === 404) {
        response = await httpService.patch<AssignRevokeResponse>(
          `/api/users/super-admin/assign-permissions/${userId}`,
          { permissions, role }
        );
      } else {
        throw err;
      }
    }
    const newPerms = response!.data.data.permissions;
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, permissions: newPerms } : u)));
    return newPerms;
  };

  const revokePermissions = async (
    userId: string,
    permissions: string[],
    role?: 'admin' | 'instructor' | 'user'
  ) => {
    let response;
    try {
      response = await httpService.patch<AssignRevokeResponse>(
        `/users/super-admin/revoke-permissions/${userId}`,
        { permissions, role }
      );
    } catch (err) {
      if (err.response?.status === 404) {
        response = await httpService.patch<AssignRevokeResponse>(
          `/api/users/super-admin/revoke-permissions/${userId}`,
          { permissions, role }
        );
      } else {
        throw err;
      }
    }
    const newPerms = response!.data.data.permissions;
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, permissions: newPerms } : u)));
    return newPerms;
  };

  const setRoleForUser = async (userId: string, role: 'admin' | 'instructor' | 'user') => {
    let response;
    try {
      response = await httpService.patch(`/users/admin/set-role/${userId}`, { role });
    } catch (err) {
      if (err.response?.status === 404) {
        response = await httpService.patch(`/api/users/admin/set-role/${userId}`, { role });
      } else {
        throw err;
      }
    }
    const updated = (response!.data as { data?: Partial<User> }).data;
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: updated?.role || role } : u))
    );
    return updated?.role || role;
  };

  return {
    users,
    total,
    loading,
    error,
    addUser,
    addUserLoading,
    addUserError,
    blockUser,
    unblockUser,
    blockUserLoading,
    blockUserError,
    resetHardwareIds,
    resetHardwareLoading,
    resetHardwareError,
    deleteUser,
    deleteUserLoading,
    deleteUserError,
    fetchUsers,
    searchUsers,
    findStudentByEmail,
    toggleIdVerification,
    updateUser,
    setUsers,
    setTotal,
    setError,
    fetchPermissionsCatalog,
    assignPermissions,
    revokePermissions,
    setRoleForUser,
  };
};
