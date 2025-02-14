import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MultiStepForm from './MultiStepForm';
import AddCategoryForm from './AddCategoryForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState([]); // Initialized to an empty array
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]); // Initialized to an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [orders, setOrders] = useState([]); // Initialized to an empty array
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Redirect to home if the user is not an admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  const handleFormToggle = () => setShowForm(!showForm);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://donjerseyssporthouseserver-5-cmus.onrender.com/categories');
      setCategoryCounts(response.data || []); // Fallback to an empty array
    } catch (error) {
      console.error('Error fetching category counts:', error);
      setError('Failed to load categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category click to fetch products
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setLoading(true);
    axios
      .get(`https://donjerseyssporthouseserver-5-cmus.onrender.com/categories/${categoryId}`)
      .then((response) => {
        setProducts(response.data || []); // Fallback to an empty array
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get('https://donjerseyssporthouseserver-5-cmus.onrender.com/orders');
      setOrders(response.data || []); // Fallback to an empty array
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

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`s://donjerseyssporthouseserver-5-cmus.onrender.com/orders/${orderId}`);
      setSelectedOrder(response.data || null); // Fallback to null
      setErrorOrders('');
    } catch (error) {
      console.error('Error fetching order details:', error);
      setErrorOrders('Failed to fetch order details. Please try again.');
    } finally {
      setLoadingOrders(false);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`https://donjerseyssporthouseserver-5-cmus.onrender.com/products/${productId}`);
        alert("Product deleted successfully!");
        setProducts(products.filter((product) => product.id !== productId)); // Update UI
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };
  
  const handleCloseModal = () => setSelectedOrder(null);

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

        <AddCategoryForm onCategoryAdded={fetchCategories} />
        <h3>Current Products by Category</h3>
        <div className="category-buttons">
          {categoryCounts && categoryCounts.length > 0 ? (
            categoryCounts.map((category) => (
              <button
                key={category.category_id}
                className={`category-btn ${activeCategory === category.category_id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.category_id)}
              >
                {category.category_name}: {category.count} items
              </button>
            ))
          ) : (
            <p>No categories available.</p>
          )}
        </div>

        {activeCategory && (
  <div className="product-table">
    <h3>Products in {categoryCounts.find((cat) => cat.category_id === activeCategory)?.category_name}</h3>
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
            <th>Actions</th> {/* Added for delete button */}
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
              <td>
                <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                  🗑️ Delete
                </button>
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


        <h2>Orders</h2>
        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : errorOrders ? (
          <p className="error-message">{errorOrders}</p>
        ) : orders && orders.length > 0 ? (
          <table className="styled-table orders-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Description</th>
      <th>Price</th>
      <th>Stock</th>
      <th>Image</th>
      <th>Actions</th> {/* Added for the delete button */}
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
                    <button onClick={() => handleViewOrder(order.id)}>View</button>
                  </td>
                </tr>
                
              ))}
           
          
         
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
        <td>
          <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
            🗑️ Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        ) : (
          <p>No orders found.</p>
        )}

        {selectedOrder && (
          <div className="order-details-modal" onClick={handleCloseModal}>
            <div className="order-details-content" onClick={(e) => e.stopPropagation()}>
              <span className="close-modal" onClick={handleCloseModal}>&times;</span>
              <h2>Order Details - Order ID: {selectedOrder.id}</h2>
              <p><strong>Customer:</strong> {selectedOrder.name}</p>
              <p><strong>Email:</strong> {selectedOrder.email}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Location:</strong> {selectedOrder.location}</p>
              <p><strong>Total Price:</strong> {selectedOrder.total_price}</p>

              <h3>Order Items</h3>
              <ul>
                {selectedOrder.order_items?.map((item, index) => (
                  <li key={index}>
                    <strong>{item.product_name}</strong>
                    <p>Description: {item.description}</p>
                    <p>Quantity: {item.quantity}</p>
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
