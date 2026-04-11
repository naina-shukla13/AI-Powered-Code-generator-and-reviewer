const express = require('express');
const router = express.Router();
const { streamReview, streamGenerate, getReviews, getReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/stream', streamReview);
router.post('/generate', streamGenerate);
router.get('/', getReviews);
router.get('/:id', getReview);
router.delete('/:id', deleteReview);

module.exports = router;