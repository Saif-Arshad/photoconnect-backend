const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Create a new post
router.post('/posts', postController.createPost);
router.get('/', postController.getAllPosts);

// Get all posts
router.get('/posts/:id', postController.getPosts);

// Get a specific post by id
router.get('/posts/:id', postController.getPostById);

// Update a specific post by id
router.put('/posts/:id', postController.updatePost);

// Delete a specific post by id
router.delete('/posts/:id', postController.deletePost);

module.exports = router;
