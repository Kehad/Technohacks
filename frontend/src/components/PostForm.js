// src/components/PostForm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PostForm.css";

const API_BASE_URL = "https://technohacks-backend.onrender.com";


function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);


  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If in edit mode, fetch existing post data
  useEffect(() => {
    if (isEditMode) {
      fetch(`${API_BASE_URL}/api/posts/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Post not found");
          }
          return response.json();
        })
        .then((data) => {
          setFormData({
            title: data.title,
            content: data.content,
            author: data.author || "",
            file: data.file || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/posts/${id}`
        : `${API_BASE_URL}/api/posts`;  

      const method = isEditMode ? "PUT" : "POST";

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("author", formData.author);
      if (image) {
        // const imageUrl = URL.createObjectURL(image);
        // formDataToSend.append("file", imageUrl);
        formDataToSend.append("file", image);
      }


      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save post");
      }

      await response.json();
      setSubmitting(false);

      // Redirect to the saved post
      navigate(`/`);
      // navigate(`/post/${savedPost.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading post data...</div>;

  return (
    <div className="post-form-container">
      <h2>{isEditMode ? "Edit Post" : "Create New Post"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter your name (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="10"
            placeholder="What is your mind..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {isEditMode && (
            <img
              // src={formData.file}
              src={`${API_BASE_URL}/${formData.file} `|| image}
              style={{ maxWidth: "40%", height: "auto" }}
              alt="Edit icture"
            />
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;
