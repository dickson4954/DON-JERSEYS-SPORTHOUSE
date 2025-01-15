import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MultiStepForm from './MultiStepForm';
import RegisterAdminForm from './RegisterAdminForm'; 
import './AdminDashboard.css';
import AddCategoryForm from './AddCategoryForm';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // Holds the currently selected order for viewing details

  const categoryImages = {
    "1": "",
    "2": "",
    "3": "",
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  const handleFormToggle = () => setShowForm(!showForm);
  const handleAdminFormToggle = () => setShowAdminForm(!showAdminForm);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/products/count-by-category');
      const data = await response.json();
      setCategoryCounts(data);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setLoading(true);
    fetch(`http://127.0.0.1:5000/products/by-category/${categoryId}`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
  const closeModal = () => setSelectedImage(null);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get('http://127.0.0.1:5000/getorders');
      setOrders(response.data);
      setErrorOrders('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorOrders('Failed to load orders. Please try again.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-dashboard">
    
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>
      
      <div className="dashboard-section">
        <h2>Manage Products</h2>
        <button className="toggle-form-btn" onClick={handleFormToggle}>
          {showForm ? 'Hide Form' : 'Add New Product'}
        </button>
        {showForm && (
          <div className="product-form-section">
            <MultiStepForm />
          </div>
        )}

        <div className="product-table-section">
          <AddCategoryForm onCategoryAdded={fetchCategories} />
          <h3>Current Products by Category</h3>
          <div className="category-buttons">
            {categoryCounts.map((category) => (
              <button
                key={category.category_id}
                className={`category-btn ${activeCategory === category.category_id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.category_id)}
                style={{ backgroundImage: `url(${categoryImages[category.category_id] || 'default-image-url.jpg'})` }}
              >
                {category.category_name}: {category.count} items
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="product-table">
              <h3>Products in {categoryCounts.find(cat => cat.category_id === activeCategory)?.category_name}</h3>
              {loading ? (
                <p>Loading products...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : products.length > 0 ? (
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>{product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            onClick={() => handleImageClick(product.image_url)} 
                            style={{ width: '50px', cursor: 'pointer' }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No products found in this category.</p>
              )}
            </div>
          )}
        </div>

        <h2>Orders</h2>
        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : errorOrders ? (
          <p className="error-message">{errorOrders}</p>
        ) : orders.length > 0 ? (
          <table className="styled-table orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.name}</td>
                  <td>{order.email}</td>
                  <td>{order.phone}</td>
                  <td>{order.location}</td>
                  <td>{order.total_price}</td>
                  <td>
                    <button onClick={() => handleViewOrder(order)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}

        {/* Modal for viewing order details */}
        {selectedOrder && (
          <div className="order-details-modal" onClick={handleCloseModal}>
            <div className="order-details-content" onClick={(e) => e.stopPropagation()}>
              <span className="close-modal" onClick={handleCloseModal}>&times;</span>
              <h2>Order Details - Order ID: {selectedOrder.id}</h2>
              <p><strong>Customer:</strong> {selectedOrder.name}</p>
              <p><strong>Email:</strong> {selectedOrder.user?.email || selectedOrder.email}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Location:</strong> {selectedOrder.location}</p>
              <p><strong>Total Price:</strong> {selectedOrder.total_price}</p>
              
              <h3>Order Items</h3>
              <ul>
                {selectedOrder.order_items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.product_name}</strong>
                    <p>Description: {item.description}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                    <p>Edition: {item.edition}</p>
                    <p>Custom Name: {item.custom_name || 'N/A'}</p>
                    <p>Custom Number: {item.custom_number || 'N/A'}</p>
                    <p>Font Type: {item.font_type || 'N/A'}</p>
                    <p>Total Item Price: {item.total_item_price}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="image-modal" onClick={closeModal}>
            <div className="image-modal-content">
              <span className="close-modal" onClick={closeModal}>&times;</span>
              <img src={selectedImage} alt="Product" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
