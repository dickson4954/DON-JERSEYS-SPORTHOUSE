import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OrderForm.css';
import ProductDetailsHeader from '../products/detail/ProductDetailsHeader';

const OrderForm = () => {
  const location = useLocation();
  const cart = location.state?.cart || [];  // Ensure cart data exists
  const cartTotal = location.state?.cartTotal || 0;

  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes for delivery details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails({ ...deliveryDetails, [name]: value });
  };

  // Log the cart data before sending it
  console.log("Cart data: ", cart);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Ensure each cart item has a variant_id
    const preparedCart = cart.map(item => ({
      variant_id: item.id,
      quantity: item.quantity || 1,
      size: item.size || "Default Size",  // Ensure size is handled properly here
      edition: item.edition || "Standard",  // Handle edition if missing
    }));
    
    

    try {
      const response = await fetch('https://donjerseysporthouseco.co.ke/backend/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: preparedCart,  // Send properly formatted cart
          delivery_details: deliveryDetails,
          total_price: cartTotal,
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        Swal.fire({
          icon: 'success',
          title: 'Order placed!',
          text: 'Your order will arrive in 1 business day. Payment is on delivery.',
          confirmButtonText: 'OK',
          timer: 9000
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order placement failed.');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Order placement failed',
        text: error.message,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ backgroundColor: '#ffecd1', minHeight: '100vh' }}>
        <ProductDetailsHeader />
        <form onSubmit={handleSubmit} className="form-container">
          <h2 className="heading">Delivery Details</h2>
          
          {/* Delivery Details Form */}
          <div className="form-group">
            <label className="label">Name:</label>
            <input
              type="text"
              name="name"
              value={deliveryDetails.name}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="(optional)"
              value={deliveryDetails.email}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">Phone:</label>
            <input
              type="text"
              name="phone"
              value={deliveryDetails.phone}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label">Delivery Location:</label>
            <input
              type="text"
              name="location"
              value={deliveryDetails.location}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </>
  );
};

export default OrderForm;
