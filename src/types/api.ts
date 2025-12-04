export type User = {
  id: number;
  username: string;
  fullName: string;
  profilePicUrl?: string;
  privateAccount: boolean;
};

export type AuthResponse = {
  token: string;
};

export type SignUpResponse = {
  message: string;
  user: User;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  fullName: string;
  username: string;
  password: string;
  profilePicUrl?: string;
  privateAccount: boolean;
};

export type UpdateUserPayload = Partial<Omit<SignupPayload, 'password'>> & {
  password?: string;
};

export type Post = {
  id: number;
  caption: string;
  imageUrl: string;
  uploadedAt: string;
  likedUsers: string[];
  user: User;
};

export type PostPayload = {
  caption: string;
  imageUrl: string;
};

export type Comment = {
  username: string;
  uploadedAt: string;
  comment: string;
};

export type CommentPayload = {
  content: string;
};

export type FollowRequest = {
  username: string;
  requestedAt: string;
};

export type FeedItem = {
  postId: number;
  caption: string;
  uploadedAt: string;
  imageUrl: string;
  username: string;
  profilePicUrl?: string;
  noOfLikes: number;
  noOfComments: number;
  likedByYou: boolean;
};

export type ApiError = {
  message: string;
  status?: number;
};

