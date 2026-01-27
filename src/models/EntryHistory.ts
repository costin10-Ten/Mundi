import mongoose, { Schema } from 'mongoose';
import { IEntryHistory } from '../types';

const entryHistorySchema = new Schema<IEntryHistory>(
  {
    entryId: {
      type: String,
      ref: 'Entry',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    editedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

entryHistorySchema.index({ entryId: 1, version: -1 });

export default mongoose.model<IEntryHistory>('EntryHistory', entryHistorySchema);
