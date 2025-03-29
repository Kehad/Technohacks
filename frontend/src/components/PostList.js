// src/components/PostList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/PostList.css";
import { formatDate } from "../utils/utils";

const API_BASE_URL = "https://technohacks-backend.onrender.com";

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch posts from API
    fetch(`${API_BASE_URL}/api/posts`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Handle delete post
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        // Remove deleted post from state
        setPosts(posts.filter((post) => post.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="post-list">
      <h2>All Posts</h2>
      {posts.length === 0 ? (
        <p className="no-posts">No posts yet. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            {/* Display the image if it exists */}
            {post.file && (
              <div className="post-image">
                <img
                  src={`${API_BASE_URL}/${post.file}`}
                  alt={post.title}
                  className="post-thumbnail"
                           style={{ maxWidth: "100%", height: "100px", objectFit: "cover", border: "1px solid black" }}

                />
              </div>
            )}
            <h3>
              <Link to={`/post/${post.id}`}>{post.title}</Link>
            </h3>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>Posted on {formatDate(post.date)}</span>
            </div>
            <p className="post-excerpt">
              {post.content.substring(0, 150)}
              {post.content.length > 150 ? "..." : ""}
            </p>
            <div className="post-actions">
              <Link to={`/post/${post.id}`} className="action-btn view">
                Read More
              </Link>
              <Link to={`/edit/${post.id}`} className="action-btn edit">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                className="action-btn delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;
