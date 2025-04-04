const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://20.244.56.144/evaluation-service';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Total Users
router.get('/users/count', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const userCount = Object.keys(response.data.users).length;
    res.json({ totalUsers: userCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User with Most Posts
router.get('/users/most-posts', async (req, res) => {
  try {
    const userRes = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });

    const users = userRes.data.users;
    let maxPosts = 0;
    let topUser = null;

    for (const userId in users) {
      const postRes = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
      });

      if (postRes.data.posts.length > maxPosts) {
        maxPosts = postRes.data.posts.length;
        topUser = { userId, name: users[userId], totalPosts: maxPosts };
      }
    }

    res.json(topUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post with Most Comments
router.get('/posts/most-comments', async (req, res) => {
  try {
    const userRes = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });

    const users = userRes.data.users;

    let mostCommentedPost = null;
    let maxComments = 0;

    for (const userId in users) {
      const postRes = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
      });

      for (const post of postRes.data.posts) {
        const commentRes = await axios.get(`${BASE_URL}/posts/${post.id}/comments`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        });

        if (commentRes.data.comments.length > maxComments) {
          maxComments = commentRes.data.comments.length;
          mostCommentedPost = {
            postId: post.id,
            content: post.content,
            comments: maxComments
          };
        }
      }
    }

    res.json(mostCommentedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
