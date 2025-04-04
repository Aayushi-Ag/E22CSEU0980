const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: Number,
  postId: Number,
  content: String,
});

module.exports = mongoose.model('Comment', commentSchema);
