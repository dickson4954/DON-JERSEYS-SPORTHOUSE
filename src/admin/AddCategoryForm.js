import React, { useState } from 'react';
import axios from 'axios';

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState('');

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    axios.post('https://donjerseyssporthouseserver-71ee.onrender.com/categories', { name: categoryName })
      .then((response) => {
        setMessage(response.data.message);
        setCategoryName('');
        onCategoryAdded();    
      })
      .catch((error) => {
        setMessage('Error adding category: ' + error.response.data.error);
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
        />
        <button type="submit">Add Category</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddCategoryForm;
