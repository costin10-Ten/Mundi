import mongoose, { Schema } from 'mongoose';
import { IEntry } from '../types';

const entrySchema = new Schema<IEntry>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categories: [
      {
        type: String,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: String,
        ref: 'Tag',
      },
    ],
    relatedEntries: [
      {
        type: String,
        ref: 'Entry',
      },
    ],
    author: {
      type: String,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

entrySchema.index({ title: 'text', content: 'text' });
entrySchema.index({ slug: 1 });
entrySchema.index({ categories: 1 });
entrySchema.index({ tags: 1 });
entrySchema.index({ status: 1 });

export default mongoose.model<IEntry>('Entry', entrySchema);
