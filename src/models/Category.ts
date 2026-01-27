import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    parent: {
      type: String,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
