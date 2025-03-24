// server.js - Main Express server file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (would use MongoDB/PostgreSQL in production)
let posts = [
  {
    id: "1",
    title: "Getting Started with Reacts",
    content: "React is a JavaScript library for building user interfaces...",
    author: "Jane Doe",
    date: "2025-03-15T10:00:00Z",
    file: "blob:http://localhost:3000/27db87e8-5f2c-480b-b2ab-f50d4decd7fe",
  },
  {
    id: "2",
    title: "Express.js Fundamentals",
    content:
      "Express is a minimal and flexible Node.js web application framework...",
    author: "John Smith",
    date: "2025-03-18T14:30:00Z",
    file: "",
  },
];

// Routes
// GET all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// GET single post by ID
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

// POST create new post
app.post('/api/posts', (req, res) => {
  console.log(req, res)
  const { title, content, author, file  } = req.body;
  console.log(file)
  
  // Validation
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  
  const newPost = {
    id: uuidv4(),
    title,
    content,
    author: author || 'Anonymous',
    date: new Date().toISOString(),
    file: file || '',
  };
  
  posts.unshift(newPost); // Add to beginning of array
  res.status(201).json(newPost);
});

// PUT update existing post
app.put('/api/posts/:id', (req, res) => {
  const { title, content, author, file } = req.body;
  const postIndex = posts.findIndex(p => p.id === req.params.id);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  // Update only provided fields
  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content,
    author: author || posts[postIndex].author,
    updated: new Date().toISOString(),
    file: file || posts[postIndex].file
  };
  
  res.json(posts[postIndex]);
});

// DELETE post
app.delete('/api/posts/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === req.params.id);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const deletedPost = posts[postIndex];
  posts = posts.filter(p => p.id !== req.params.id);
  
  res.json(deletedPost);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
