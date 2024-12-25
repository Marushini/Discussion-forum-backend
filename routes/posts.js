const express = require('express');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a post
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  // Validate input
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const post = new Post({ title, content, createdBy: req.user.id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post.' });
  }
});

// Get all posts with replies
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Add pagination

  try {
    // Fetch posts with pagination
    const posts = await Post.find()
      .populate('createdBy', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Fetch all replies for the retrieved posts
    const postIds = posts.map(post => post._id);
    const replies = await Reply.find({ postId: { $in: postIds } }).populate('createdBy', 'username');

    // Group replies by postId
    const repliesByPostId = replies.reduce((acc, reply) => {
      acc[reply.postId] = acc[reply.postId] || [];
      acc[reply.postId].push(reply);
      return acc;
    }, {});

    // Attach replies to their respective posts
    posts.forEach(post => {
      post.replies = repliesByPostId[post._id] || [];
    });

    // Calculate total posts for pagination
    const totalPosts = await Post.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts. Please try again later.' });
  }
});

// Edit a post - Ensure only the creator can edit
router.put('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  // Validate input
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    // Check if the logged-in user is the one who created the post
    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to edit this post.' });
    }

    // Update the post
    post.title = title;
    post.content = content;

    // Save the updated post
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error('Error editing post:', err);
    res.status(500).json({ message: 'Failed to edit post.' });
  }
});

// Delete a post - Ensure only the creator can delete
router.delete('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    // Check if the logged-in user is the one who created the post
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    // Delete the post and its associated replies
    await Reply.deleteMany({ postId });
    await post.remove();

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post.' });
  }
});

module.exports = router;
