import apiClient from './http';
import type {
  AuthResponse,
  Comment,
  CommentPayload,
  FeedItem,
  FollowRequest,
  LoginPayload,
  Post,
  PostPayload,
  SignupPayload,
  SignUpResponse,
  UpdateUserPayload,
  User
} from '../types/api';

const unwrap = <T>(promise: Promise<{ data: T }>) =>
  promise.then((response) => response.data);

export const AuthApi = {
  login: (payload: LoginPayload) =>
    unwrap<AuthResponse>(apiClient.post('/auth/login', payload)),
  signup: (payload: SignupPayload) =>
    unwrap<SignUpResponse>(apiClient.post('/auth/signup', payload)),
  currentUser: () => unwrap<User>(apiClient.get('/auth/me'))
};

export const UserApi = {
  getAll: () => unwrap<User[]>(apiClient.get('/users')),
  getById: (id: number) => unwrap<User>(apiClient.get(`/users/${id}`)),
  update: (id: number, payload: UpdateUserPayload) =>
    unwrap<User>(apiClient.put(`/users/${id}`, payload))
};

export const PostApi = {
  create: (payload: PostPayload) =>
    unwrap<Post>(apiClient.post('/posts', payload)),
  listMine: () => unwrap<Post[]>(apiClient.get('/posts')),
  listByUser: (username: string) =>
    unwrap<Post[]>(apiClient.get(`/posts/user/${username}`)),
  delete: (postId: number) => apiClient.delete(`/posts/${postId}`),
  deleteAllMine: () => apiClient.delete('/posts'),
  like: (postId: number) => apiClient.post(`/posts/${postId}/like`),
  unlike: (postId: number) => apiClient.delete(`/posts/${postId}/unlike`)
};

export const CommentApi = {
  listByPost: (postId: number) =>
    unwrap<Comment[]>(apiClient.get(`/posts/${postId}/comments`)),
  create: (postId: number, payload: CommentPayload) =>
    unwrap<Comment>(apiClient.post(`/posts/${postId}/comments`, payload)),
  delete: (commentId: number) => apiClient.delete(`/comments/${commentId}`)
};

export const FollowApi = {
  follow: (username: string) => apiClient.post(`/users/${username}/follow`),
  unfollow: (username: string) => apiClient.delete(`/users/${username}/unfollow`),
  followers: () => unwrap<User[]>(apiClient.get('/users/followers')),
  following: () => unwrap<User[]>(apiClient.get('/users/following')),
  followersOf: (username: string) =>
    unwrap<User[]>(apiClient.get(`/users/${username}/followers`)),
  followingOf: (username: string) =>
    unwrap<User[]>(apiClient.get(`/users/${username}/following`)),
  requests: () =>
    unwrap<FollowRequest[]>(apiClient.get('/users/follow-requests')),
  accept: (username: string) =>
    apiClient.patch(`/users/follow/${username}/accept`),
  reject: (username: string) =>
    apiClient.patch(`/users/follow/${username}/reject`)
};

export const FeedApi = {
  list: () => unwrap<FeedItem[]>(apiClient.get('/feed'))
};

