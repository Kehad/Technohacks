// src/components/PostDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import "../styles/PostDetail.css";
import { formatDate } from "../utils/utils";

const API_BASE_URL = "https://technohacks-backend.onrender.com";


function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch post details from API
    fetch(`${API_BASE_URL}/api/posts/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Post not found");
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Handle delete post
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete post");
        }

        // Redirect to home after deletion
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      <div className="post-meta">
        <span>By {post.author}</span>
        <span>Posted on {formatDate(post.date)}</span>
        {post.updated && <span>(Updated: {formatDate(post.updated)})</span>}
      </div>


      <div className="post-content">
        {post.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {/* Display the image if it exists */}
      {post.file && (
        <div className="post-image">
          {/* <img
            src={`http://localhost:5000/${post.file}`}
            alt={post.title}
            className="post-image"
          /> */}
          <img
              // src={formData.file}
            src={`${API_BASE_URL}/${post.file}`} 
              style={{ maxWidth: "100%", height: "auto" }}
              alt={post.title}
            className="post-image"
            />
        </div>
      )}

      <div className="post-actions">
        <Link to="/" className="action-btn back">
          Back to List
        </Link>
        <Link to={`/edit/${post.id}`} className="action-btn edit">
          Edit Post
        </Link>
        <button onClick={handleDelete} className="action-btn delete">
          Delete Post
        </button>
      </div>
    </div>
  );
}

export default PostDetail;
