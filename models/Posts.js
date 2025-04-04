const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postId: Number,
  userId: Number,
  content: String,
});

module.exports = mongoose.model('Post', postSchema);
