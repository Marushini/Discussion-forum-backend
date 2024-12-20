const express = require('express');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
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
    res.status(400).json({ message: err.message });
  }
});

// Get all posts with replies
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', 'username')
      .lean(); // Converts to a plain JavaScript object

    for (let post of posts) {
      const replies = await Reply.find({ postId: post._id }).populate('createdBy', 'username');
      post.replies = replies;
    }

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
