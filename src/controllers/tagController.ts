import { Response } from 'express';
import Tag from '../models/Tag';
import Entry from '../models/Entry';
import { AuthRequest } from '../types';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getAllTags = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tags = await Tag.find().sort({ name: 1 });

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTagBySlug = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOne({ slug });

    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    const entries = await Entry.find({ tags: tag._id })
      .populate('author', 'username')
      .populate('categories', 'name slug')
      .sort({ updatedAt: -1 });

    res.json({ tag, entries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTag = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    const slug = generateSlug(name);

    const existingTag = await Tag.findOne({ slug });
    if (existingTag) {
      res.status(400).json({ message: 'Tag already exists' });
      return;
    }

    const tag = new Tag({
      name,
      slug,
    });

    await tag.save();

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTag = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    const tag = await Tag.findOne({ slug });

    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    if (name) {
      tag.name = name;
      tag.slug = generateSlug(name);
    }

    await tag.save();

    res.json({
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTag = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOneAndDelete({ slug });

    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
