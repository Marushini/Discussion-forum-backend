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
    res.status(400).send(err.message);
  }
});

// Like a reply
router.post('/:postId/replies/:replyId/like', authMiddleware, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }
    reply.likes += 1;
    await reply.save();
    res.json(reply);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Dislike a reply
router.post('/:postId/replies/:replyId/dislike', authMiddleware, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).send('Reply not found');
    }
    reply.dislikes += 1;
    await reply.save();
    res.json(reply);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
