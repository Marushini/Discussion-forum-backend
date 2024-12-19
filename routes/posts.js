const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content, createdBy: req.user.id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Like a post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Dislike a post
router.post('/:id/dislike', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.dislikes += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
