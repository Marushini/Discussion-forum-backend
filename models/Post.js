const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // To track the number of likes or dislikes on the post
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Add indexes for efficient querying (optional but recommended)
postSchema.index({ createdAt: -1 }); // Sort by creation date descending

module.exports = mongoose.model('Post', postSchema);
