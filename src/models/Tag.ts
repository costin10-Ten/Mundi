import mongoose, { Schema } from 'mongoose';
import { ITag } from '../types';

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ slug: 1 });

export default mongoose.model<ITag>('Tag', tagSchema);
