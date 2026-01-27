import express from 'express';
import { body } from 'express-validator';
import {
  getAllTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tagController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

router.get('/', getAllTags);

router.get('/:slug', getTagBySlug);

router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('name').trim().notEmpty().isLength({ max: 50 }),
    validate,
  ],
  createTag
);

router.put(
  '/:slug',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('name').optional().trim().isLength({ max: 50 }),
    validate,
  ],
  updateTag
);

router.delete(
  '/:slug',
  authenticate,
  authorize('admin'),
  deleteTag
);

export default router;
