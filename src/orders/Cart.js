import React, { useContext } from 'react';
import CartContext from '../CartContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Cart.css';
import ProductDetailsHeader from '../products/detail/ProductDetailsHeader';

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  // Function to calculate the customization charge
  const calculateCustomizationCharge = (item) => {
    let customizationCharge = 0;

    // Add charge for Name, Number, Font Type, and Badge
    if (item.customName) customizationCharge += 200;  // 200 for Name
    if (item.customNumber) customizationCharge += 200;  // 200 for Number
    if (item.fontType) customizationCharge += 100;  // 100 for Font Type
    if (item.badge) customizationCharge += 100;  // 100 for Badge

    return customizationCharge;
  };

  // Calculate total including dynamic customization charges
  const cartTotal = cart.reduce((total, item) => {
    const customizationCharge = calculateCustomizationCharge(item);
    return total + item.quantity * (item.price + customizationCharge);  // Add customization charge to total price
  }, 0);

  function handleOrderClick() {
    if (cart.length === 0) {
      alert("Your cart is empty. Add items before proceeding.");
      return;
    }
    navigate("/order-payment", { state: { cart, cartTotal } });
  }

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
                const customizationCharge = calculateCustomizationCharge(item);  // Get dynamic customization charge
                return (
                  <div key={index} className="cart-item">
                    {/* Column 1: Image */}
                    <div className="cart-item-col image-col">
                      <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    </div>

                    {/* Column 2: Product Details */}
                    <div className="cart-item-col details-col">
                      <h5 className="item-name">{item.name}</h5>
                      <p className="item-price">KES {item.price.toFixed(2)}</p>
                      <p className="customization-charge">Customization Charges: KES {customizationCharge}</p>
                    </div>

                    {/* Column 3: Customization Charges */}
                    <div className="cart-item-col customization-charges-col">
                      <p className="kit-edition">Kit Edition: {item.edition}</p>
                      <p className="size">Size (Adult): {item.size}</p>
                    </div>

                    {/* Column 4: Customization Options */}
                    <div className="cart-item-col customization-options-col">
                      <h6>Customization</h6>
                      {item.badge && <p><strong>Badge:</strong> {item.badge}</p>} {/* Added badge */}
                      {item.foundation && <p><strong>Foundation:</strong> {item.foundation}</p>}
                      {item.customName && <p><strong>Name:</strong> {item.customName}</p>}
                      {item.customNumber && <p><strong>Number:</strong> {item.customNumber}</p>}
                      {item.fontType && <p><strong>Font Type:</strong> {item.fontType}</p>}
                    </div>

                    {/* Column 5: Quantity Controls */}
                    <div className="cart-item-col controls-col">
                      <button className="minus" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <div className="quantity-box">
                        {item.quantity}
                      </div>
                      <button className="plus" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <span className="total-price">KES {(item.price * item.quantity + customizationCharge * item.quantity).toFixed(2)}</span>
                    </div>

                    {/* Column 6: Trash Icon */}
                    <div className="cart-item-col remove-btn">
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="order-summary-products">
                  {cart.map((item, index) => {
                    const customizationCharge = calculateCustomizationCharge(item);
                    return (
                      <div key={index} className="order-summary-product">
                        <img src={item.image_url} alt={item.name} />
                        <div className="order-summary-product-details">
                          <div className="order-summary-product-name" style={{ fontWeight: 'bold' }}>{item.name}</div>
                          <div className="order-summary-product-info" style={{ fontWeight: 'bold' }}>
                            Size: {item.size || "N/A"}, 
                            Edition: {item.edition || "N/A"}
                          </div>

                          {/* Show customization options with their prices */}
                          <div className="order-summary-product-customizations" style={{ fontWeight: 'bold' }}>
                            {item.badge && <p><strong>Badge:</strong> KES 100</p>} {/* Price for Badge */}
                            {item.customName && <p><strong>Name:</strong> KES 200</p>} {/* Price for Name */}
                            {item.customNumber && <p><strong>Number:</strong> KES 200</p>} {/* Price for Number */}
                            {item.fontType && <p><strong>Font Type:</strong> KES 100</p>} {/* Price for Font Type */}
                          </div>
                        </div>
                        <div className="order-summary-product-quantity" style={{ fontWeight: 'bold' }}>{item.quantity}</div>
                        <div className="order-summary-product-price" style={{ fontWeight: 'bold' }}>
                          KES {(item.price * item.quantity + customizationCharge * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-summary-total" style={{ fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span>KES {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button onClick={() => navigate("/products")} className="continue-btn">
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
    </>
  );
}

export default Cart;
