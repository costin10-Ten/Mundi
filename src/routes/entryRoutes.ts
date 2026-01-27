import express from 'express';
import { body } from 'express-validator';
import {
  getAllEntries,
  getEntryBySlug,
  createEntry,
  updateEntry,
  deleteEntry,
  getEntryHistory,
  searchEntries,
} from '../controllers/entryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

router.get('/search', searchEntries);

router.get('/', getAllEntries);

router.get('/:slug', getEntryBySlug);

router.get('/:slug/history', authenticate, getEntryHistory);

router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('content').notEmpty(),
    body('status').optional().isIn(['draft', 'published']),
    validate,
  ],
  createEntry
);

router.put(
  '/:slug',
  authenticate,
  authorize('admin', 'editor'),
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('content').optional(),
    body('status').optional().isIn(['draft', 'published']),
    validate,
  ],
  updateEntry
);

router.delete(
  '/:slug',
  authenticate,
  authorize('admin'),
  deleteEntry
);

export default router;
