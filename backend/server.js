// server.js - Main Express server file
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer"); // Import multer for file uploads
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Helper function to read and write data to upload.json
const DATA_FILE = path.join(__dirname, "upload.json");

const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Routes
// GET all posts
app.get("/api/posts", (req, res) => {
  const posts = readData();
  res.json(posts);
});

// GET single post by ID
app.get("/api/posts/:id", (req, res) => {
  const posts = readData();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(post);
});

// POST create new post with file upload
app.post("/api/posts", upload.single("file"), (req, res) => {
  const { title, content, author } = req.body;
  const file = req.file ? req.file.path : "";

  // Validation
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const newPost = {
    id: uuidv4(),
    title,
    content,
    author: author || "Anonymous",
    date: new Date().toISOString(),
    file,
  };

  const posts = readData();
  posts.unshift(newPost); // Add to beginning of array
  writeData(posts);
  res.status(201).json(newPost);
});

// PUT update existing post with file upload
app.put("/api/posts/:id", upload.single("file"), (req, res) => {
  const { title, content, author } = req.body;
  const file = req.file ? req.file.path : "";
  const posts = readData();
  const postIndex = posts.findIndex((p) => p.id === req.params.id);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Update only provided fields
  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content,
    author: author || posts[postIndex].author,
    updated: new Date().toISOString(),
    file: file || posts[postIndex].file,
  };

  writeData(posts);
  res.json(posts[postIndex]);
});

// DELETE post
app.delete("/api/posts/:id", (req, res) => {
  const posts = readData();
  const postIndex = posts.findIndex((p) => p.id === req.params.id);

  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  const deletedPost = posts[postIndex];
  const updatedPosts = posts.filter((p) => p.id !== req.params.id);

  writeData(updatedPosts);
  res.json(deletedPost);
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
