export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  banned: boolean;
}

export interface Tool {
  id: string;
  name: string;
  quantity: string | null;
}

export interface Step {
  id: string;
  order: number;
  title: string;
  content: string;
  imageUrl: string | null;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  timeMinutes: number;
  coverImage: string | null;
  published: boolean;
  locked: boolean;
  price: number;
  authorId: string;
  author: Pick<User, "id" | "name">;
  tools: Tool[];
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

export interface TutorialListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  timeMinutes: number;
  coverImage: string | null;
  published: boolean;
  locked: boolean;
  price: number;
  author: Pick<User, "id" | "name">;
  _count: {
    steps: number;
  };
  createdAt: string;
}


export interface SystemLog {
  id: string;
  action: string;
  target: string | null;
  actor: Pick<User, "id" | "name" | "email">;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTutorials: number;
  totalImages: number;
  recentLogs: SystemLog[];
}

export const CATEGORIES = [
  "DIY",
  "Cooking",
  "Tech",
  "Crafts",
  "Home Improvement",
  "Gardening",
  "Vehicles",
  "Electronics",
  "Woodworking",
  "Sewing",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
