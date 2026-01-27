import { Response } from 'express';
import Entry from '../models/Entry';
import EntryHistory from '../models/EntryHistory';
import { AuthRequest } from '../types';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getAllEntries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const entries = await Entry.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug');

    const total = await Entry.countDocuments(filter);

    res.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEntryBySlug = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const entry = await Entry.findOne({ slug })
      .populate('author', 'username email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .populate('relatedEntries', 'title slug');

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    entry.views += 1;
    await entry.save();

    res.json({ entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createEntry = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, categories, tags, relatedEntries, status } = req.body;

    let slug = generateSlug(title);
    const existingEntry = await Entry.findOne({ slug });
    if (existingEntry) {
      slug = `${slug}-${Date.now()}`;
    }

    const entry = new Entry({
      title,
      content,
      slug,
      categories: categories || [],
      tags: tags || [],
      relatedEntries: relatedEntries || [],
      author: req.user?.id,
      status: status || 'draft',
    });

    await entry.save();

    const history = new EntryHistory({
      entryId: entry._id,
      title: entry.title,
      content: entry.content,
      version: 1,
      editedBy: req.user?.id,
    });

    await history.save();

    res.status(201).json({
      message: 'Entry created successfully',
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateEntry = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { title, content, categories, tags, relatedEntries, status } = req.body;

    const entry = await Entry.findOne({ slug });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    const lastHistory = await EntryHistory.findOne({ entryId: entry._id })
      .sort({ version: -1 });

    const newVersion = lastHistory ? lastHistory.version + 1 : 1;

    const history = new EntryHistory({
      entryId: entry._id,
      title: title || entry.title,
      content: content || entry.content,
      version: newVersion,
      editedBy: req.user?.id,
    });

    await history.save();

    if (title) {
      entry.title = title;
      entry.slug = generateSlug(title);
    }
    if (content) entry.content = content;
    if (categories) entry.categories = categories;
    if (tags) entry.tags = tags;
    if (relatedEntries) entry.relatedEntries = relatedEntries;
    if (status) entry.status = status;

    await entry.save();

    res.json({
      message: 'Entry updated successfully',
      entry,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteEntry = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const entry = await Entry.findOneAndDelete({ slug });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    await EntryHistory.deleteMany({ entryId: entry._id });

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEntryHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const entry = await Entry.findOne({ slug });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    const history = await EntryHistory.find({ entryId: entry._id })
      .sort({ version: -1 })
      .populate('editedBy', 'username email');

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const searchEntries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const entries = await Entry.find({
      $text: { $search: q as string },
    })
      .populate('author', 'username email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .limit(20);

    res.json({ entries, count: entries.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
