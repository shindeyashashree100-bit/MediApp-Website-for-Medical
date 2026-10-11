export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string | null;
};