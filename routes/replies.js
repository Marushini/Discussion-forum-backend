const express = require('express');
const Reply = require('../models/Reply');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add a reply to a post
router.post('/:postId/replies', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    const reply = new Reply({
      content,
      postId: req.params.postId,
      createdBy: req.user.id,
    });

    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a reply
router.post('/:postId/replies/:replyId/like', authMiddleware, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    reply.likes += 1;
    await reply.save();
    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dislike a reply
router.post('/:postId/replies/:replyId/dislike', authMiddleware, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    reply.dislikes += 1;
    await reply.save();
    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all replies for a post
router.get('/:postId/replies', async (req, res) => {
  try {
    const replies = await Reply.find({ postId: req.params.postId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json(replies);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
