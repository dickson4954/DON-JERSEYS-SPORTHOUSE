import React, { useContext, useState } from 'react';
import CartContext from '../CartContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Cart.css';
import ProductDetailsHeader from '../products/detail/ProductDetailsHeader';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const calculateCustomizationCharge = (item) => {
    if (!item) return 0;
    let customizationCharge = 0;
    if (item.customName) customizationCharge += 200;
    if (item.customNumber) customizationCharge += 200;
    if (item.fontType) customizationCharge += 0;
    if (item.badge) customizationCharge += 100;
    return customizationCharge;
  };
  

  const cartTotal = cart.reduce((total, item) => {
    const customizationCharge = calculateCustomizationCharge(item);
    console.log(`Customization Charge for ${item.name}: KES ${customizationCharge}`);
    return total + (item.price + customizationCharge) * item.quantity;
  }, 0);
  

  const hasCustomization = cart.some(
    (item) => item.customName || item.customNumber || item.fontType || item.badge
  );
  
  const hasSizeOrEditionOnly = cart.some(
    (item) => (item.size || item.edition) && !item.customName && !item.customNumber && !item.badge
  );
  
  
  const handleOrderClick = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Add items before proceeding.');
      return;
    }
    setShowModal(true);
  };

  const handlePaymentOnDelivery = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Add items before proceeding.');
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.location) {
      alert('Please fill in all required fields: Name, Phone, and Location.');
      return;
    }
  
    setShowModal(false);
    setFormData({ name: '', phone: '', location: '' });
    navigate('/shipping-page', { state: { ...formData, cart } }); // Ensure name is included
  };
  
  const handlePayNow = () => {
    if (!formData.name || !formData.phone || !formData.location) {
      alert('Please fill in all required fields: Name, Phone, and Location.');
      return;
    }
  
    if (cart.length === 0) {
      alert('Your cart is empty. Add items before proceeding.');
      return;
    }
  
    // Calculate total amount with customization charge
    const totalCustomizationCharge = cart.reduce((total, item) => {
      return total + calculateCustomizationCharge(item) * item.quantity;
    }, 0);
  
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    let discountedTotal = totalAmount + totalCustomizationCharge;
  
    if (hasCustomization) {
      const customizationDiscount = 100; // Discount for customization
      discountedTotal -= customizationDiscount;
    }
  
    alert(
      `Order placed successfully! ${
        hasCustomization ? 'You saved KES 100 on customization charges.' : ''
      } Total paid: KES ${discountedTotal.toFixed(2)}`
    );
  
    setShowModal(false);
    setFormData({ name: '', phone: '', location: '' });
  
    // Pass discountedTotal and other necessary data to shipping page
    navigate('/shipping-page', {
      state: {
        ...formData, // Ensure name is included
        cart: cart,  // Include the cart with updated item quantities and discounts
        discountedTotal: discountedTotal, // Include the discount if applied
      }
    });
  };


  return (
    <>
      <ProductDetailsHeader />
      <div className="cart-container">
        <div className="cart-content">
          <header className="cart-header d-flex justify-content-between align-items-center">
            <h2>Your Cart</h2>
            <button className="cart-button">Cart ({cart.length})</button>
          </header>

          {cart.length > 0 ? (
            <div className="cart-items">
              {cart.map((item, index) => {
               
                return (
                  <div key={index} className="cart-item">
                  <div className="cart-item-col image-col">
                    <img src={item.image_url} alt={item.name} className="cart-item-image" />
                  </div>
                  <div className="cart-item-col details-col">
                    <h5 className="item-name">{item.name}</h5>
                    <p>Edition: {item.edition || 'N/A'}</p>  
                    <p className="item-price">KES {item.price.toFixed(2)}</p>
                    <p>Size: {item.size || 'N/A'}</p>
                  </div>
                  <div className="cart-item-col customization-col">
                    <p>{item.customName && `Custom Name: ${item.customName}`}</p>
                    <p>{item.customNumber && `Custom Number: ${item.customNumber}`}</p>
                    <p>{item.fontType && `Font Type: ${item.fontType}`}</p>
                    <p>{item.badge && `Badge: ${item.badge}`}</p>
                  </div>
                  <div className="cart-item-col controls-col">
                    <button
                      className="minus"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <div className="quantity-box">{item.quantity}</div>
                    <button
                      className="plus"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    
                  </div>
                  <div className="cart-item-col remove-btn">
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                      🗑️
                    </button>
                  
                
                    </div>
                  </div>
                );
              })}
              <div className="cart-actions">
                <button onClick={() => navigate('/products')} className="continue-btn">
                  Continue Shopping
                </button>
                <button onClick={handleOrderClick} className="order-btn">
                  Order Now
                </button>
              </div>
            </div>
          ) : (
            <p className="empty-cart">Your cart is empty.</p>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {cart.map((item, index) => (
              <div key={index} className="order-item d-flex align-items-center mb-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="order-item-image me-3 rounded"
                  style={{ width: '60px', height: '60px' }}
                />
                <div>
                  <p className="mb-1">
                    <strong>{item.name}</strong> x {item.quantity}
                  </p>
                  <p className="mb-0 text-muted">
                    Total: KES{' '}
                    {(
                      item.quantity * (item.price + calculateCustomizationCharge(item))
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <hr />
            <p className="text-end fw-bold">Total: KES {cartTotal.toFixed(2)}</p>
          </div>

          <Form>
            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <h6 className="m-2">Name*</h6>
              <InputGroup className="ms-auto">
                <InputGroup.Text><FaUser /></InputGroup.Text>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <h6 className="m-2">Phone*</h6>
              <InputGroup className="ms-auto">
                <InputGroup.Text><FaPhone /></InputGroup.Text>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <h6 className="m-2">Location*</h6>
              <InputGroup className="ms-auto">
                <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your location"
                />
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>

       
        <Modal.Footer className="d-flex justify-content-between">
  {hasSizeOrEditionOnly ? (
    <>
      <Button variant="dark" className="w-100 me-2 m-1 h-20" onClick={handlePaymentOnDelivery}>
        Payment on Delivery
      </Button>
      <Button variant="primary" className="w-100 m-1 h-20" onClick={handlePayNow}>
        Pay Now and Get 10% Discount
      </Button>
    </>
  ) : hasCustomization ? (
    <Button variant="primary" className="w-100 m-1 h-20" onClick={handlePayNow}>
      Pay Now and Get 10% Discount
    </Button>
  ) : null}
</Modal.Footer>



      </Modal>
    </>
  );
}

export default Cart;
