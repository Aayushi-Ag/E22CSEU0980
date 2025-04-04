// 1. Imports and Config
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('./models/User');
const Post = require('./models/Posts');
const Comment = require('./models/Comments');
const analyticsRoutes = require('./routes/analytics'); // ✅ only one declaration

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;
const BEARER_TOKEN = process.env.ACCESS_TOKEN;

// 2. MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

// 🔁 3. FUNCTION 1: Fetch Users
async function fetchUsers() {
  try {
    const response = await axios.get('http://20.244.56.144/evaluation-service/users', {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` }, // ✅ use BEARER_TOKEN here
    });

    const users = response.data.users;

    for (const id in users) {
      await User.findOneAndUpdate(
        { userId: parseInt(id) },
        { name: users[id] },
        { upsert: true }
      );
    }

    console.log('Users synced.');
  } catch (err) {
    console.error('User fetch error:', err.message);
  }
}

// 🔁 4. FUNCTION 2: Fetch Posts & Comments
async function fetchPostsAndComments() {
  const users = await User.find();

  for (const user of users) {
    try {
      const postRes = await axios.get(`http://20.244.56.144/evaluation-service/users/${user.userId}/posts`, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });

      const posts = postRes.data.posts;

      for (const post of posts) {
        await Post.findOneAndUpdate(
          { postId: post.id },
          {
            userId: post.userId,
            content: post.content,
          },
          { upsert: true }
        );

        try {
          const commentRes = await axios.get(`http://20.244.56.144/evaluation-service/posts/${post.id}/comments`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
          });

          const comments = commentRes.data.comments;
          for (const comment of comments) {
            await Comment.findOneAndUpdate(
              { commentId: comment.id },
              {
                postId: comment.postId,
                content: comment.content,
              },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error(`Error fetching comments for post ${post.id}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error fetching posts for user ${user.userId}:`, err.message);
    }
  }

  console.log('Posts and comments synced.');
}

// ✅ Use analytics routes
app.use('/analytics', analyticsRoutes);



// ✅ Start Server and Sync
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  fetchUsers().then(fetchPostsAndComments);
});
