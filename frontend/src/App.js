// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./components/PostList.js";
import PostDetail from "./components/PostDetail.js";
import PostForm from "./components/PostForm.js";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>React Blog</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/new">New Post</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/new" element={<PostForm />} />
            <Route path="/edit/:id" element={<PostForm />} />
          </Routes>
        </main>

        <footer>
          <p>&copy; 2025 React Blog - Built with React & Express</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
