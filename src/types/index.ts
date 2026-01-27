import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IEntry extends Document {
  title: string;
  content: string;
  slug: string;
  categories: string[];
  tags: string[];
  relatedEntries: string[];
  author: string;
  status: 'draft' | 'published';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  parent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITag extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntryHistory extends Document {
  entryId: string;
  title: string;
  content: string;
  version: number;
  editedBy: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}
