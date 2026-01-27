import { Response } from 'express';
import Category from '../models/Category';
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

export const getAllCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name slug')
      .sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCategoryBySlug = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).populate('parent', 'name slug');

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const entries = await Entry.find({ categories: category._id })
      .populate('author', 'username')
      .populate('tags', 'name slug')
      .sort({ updatedAt: -1 });

    res.json({ category, entries });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, parent } = req.body;

    const slug = generateSlug(name);

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = new Category({
      name,
      slug,
      description,
      parent: parent || null,
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { name, description, parent } = req.body;

    const category = await Category.findOne({ slug });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (name) {
      category.name = name;
      category.slug = generateSlug(name);
    }
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent;

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOneAndDelete({ slug });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
