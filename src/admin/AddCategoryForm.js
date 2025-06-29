import React, { useState } from 'react';
import axios from 'axios';

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState('');

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to add a category.');
      return;
    }

    axios.post(
      'https://donjerseysporthouseco.co.ke/backend/api/products/categories',
      { name: categoryName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      setMessage(response.data.message);
      setCategoryName('');
      if (onCategoryAdded) onCategoryAdded();
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
        <button type="submit">Add Category</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddCategoryForm;
