import express from 'express';
import { body } from 'express-validator';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

router.get('/', getAllCategories);

router.get('/:slug', getCategoryBySlug);

router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    validate,
  ],
  createCategory
);

router.put(
  '/:slug',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('name').optional().trim().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    validate,
  ],
  updateCategory
);

router.delete(
  '/:slug',
  authenticate,
  authorize('admin'),
  deleteCategory
);

export default router;
