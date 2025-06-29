import React, { useState } from 'react';
import axios from 'axios';

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState('');
  // Optional: if you want to upload an image file
  const [imageFile, setImageFile] = useState(null);

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // your stored JWT token
    if (!token) {
      setMessage('You must be logged in to add a category.');
      return;
    }

    // Create FormData and append fields
    const formData = new FormData();
    formData.append('name', categoryName);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    axios.post(
      'https://donjerseysporthouseco.co.ke/backend/api/products/categories',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // important!
        },
      }
    )
    .then((response) => {
      setMessage(response.data.message);
      setCategoryName('');
      setImageFile(null);
      onCategoryAdded();
    })
    .catch((error) => {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      setMessage('Error adding category: ' + errorMsg);
    });
  };

  return (
    <div className="add-category-form">
      <h3>Add New Category</h3>
      <form onSubmit={handleCategorySubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        {/* Optional image upload input */}
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImageFile(e.target.files[0])} 
        />
        <button type="submit">Add Category</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddCategoryForm;
