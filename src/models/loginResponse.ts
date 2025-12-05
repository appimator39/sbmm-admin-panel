export interface User {
  email: string;
  userId: string;
  role: string;
  name: string;
  userAvatar: string;
  permissions?: string[];
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    token: string;
    user: User;
    permissions?: string[];
  };
}
