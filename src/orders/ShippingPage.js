import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../CartContext";
import ProductDetailsHeader from "../products/detail/ProductDetailsHeader";
import axios from "axios";
import { useLocation } from "react-router-dom";




export default function ShippingPage() {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext); // Fetching cart from CartContext
  const [formData, setFormData] = useState({
    physicalAddress: "",
    city: "",
    county: "",
    postalCode: "",
    apartment: "",
    phoneNumber: "", // Added for mobile money
    region: "", // Added to store selected region
  });


  const [shippingFee, setShippingFee] = useState(0); // Set initial shipping fee to 0
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false); // For loading state during calculation
  const [formErrors, setFormErrors] = useState({}); // To handle validation errors
  const [itemTotal, setItemTotal] = useState(0);
  const [customizationDiscount] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState(""); // For payment phone number


  // Validate phone number for payment
  const validatePhoneNumber = (number) => {
    return /^07\d{8}$/.test(number);
  };


  // Handle payment submission
  const handlePayment = async (event) => {
    event.preventDefault();


    // Check if phone number is provided
    if (!paymentPhoneNumber) {
      alert("Please enter your phone number.");
      return;
    }


    // Validate phone number format
    if (!validatePhoneNumber(paymentPhoneNumber)) {
      alert("Please enter a valid Kenyan phone number starting with 07.");
      return;
    }


    // Check if totalPrice is valid
    if (totalPrice === undefined || totalPrice <= 0) {
      alert("Total price is invalid. Please check your order.");
      return;
    }


    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/pay", {
        phone_number: paymentPhoneNumber,
        amount: totalPrice,
      });


      if (response.data.CheckoutRequestID) {
        alert("Payment initiated successfully!");
        // Redirect or perform further actions as needed
        handlePayNow(); // Proceed to place the order after successful payment
      } else {
        alert("Payment initiation failed: " + response.data.error);
      }
    } catch (error) {
      console.error("Error during payment:", error);
      alert("An error occurred while processing the payment.");
    } finally {
      setLoading(false);
    }
  };


  // Rest of your existing code (validateForm, calculateCustomizationCharge, useEffect, handleChange, calculateShippingFee, calculateTotalPrice, handlePayNow)...
  const validateForm = () => {
    let errors = {};
    if (!formData.physicalAddress) errors.physicalAddress = "Physical address is required.";
    if (!formData.city) errors.city = "City is required.";
    if (!formData.county) errors.county = "County is required.";
    if (!formData.postalCode) errors.postalCode = "Postal code is required.";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required.";
    if (!formData.region) errors.region = "Region must be selected.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const calculateCustomizationCharge = (item) => {
    let customizationCharge = 0;
    if (item.customName) customizationCharge += 200;
    if (item.customNumber) customizationCharge += 200;
    if (item.badge) customizationCharge += 100;
    return customizationCharge;
  };
 
 
  const location = useLocation();
  const formDataFromCart = location.state || {};  // Access the passed form data


  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      physicalAddress: formDataFromCart.location || '',
      phoneNumber: formDataFromCart.phone || '',
      name: formDataFromCart.name || '', // Ensure name is set
      region: formDataFromCart.region || '',
    }));
 
    // Get the updated discounted total from the cart
    if (formDataFromCart.discountedTotal) {
      setDiscountedTotal(formDataFromCart.discountedTotal); // Set the discounted total if available
      setTotalPrice(formDataFromCart.discountedTotal); // Set the total price to discounted total
    } else {
      calculateTotalPrice(shippingFee);  // Otherwise, recalculate the total
    }
  }, [formDataFromCart]);




  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "region") {
      calculateShippingFee(e.target.value);
    }


    // When region changes, calculate the shipping fee
    if (e.target.name === "region") {
      calculateShippingFee(e.target.value);
    }
  };


  const calculateShippingFee = (region) => {
    setLoading(true); // Show loading state while calculating shipping
    let fee = 0; // Default shipping fee


    // Set the shipping fee based on selected region
    switch (region) {
        case "Nairobi CBD":
            fee = 100;
            break;
        case "Public Means":
            fee = 300;
            break;
        case "ZONE 1":
        case "ZONE 2":
        case "ZONE 3":
            fee = 300;
            break;
        case "ZONE 4":
            fee = 700;
            break;
        case "ZONE 5":
            fee = 500;
            break;
        case "ZONE 6":
            fee = 800;
            break;
        case "ZONE 7":
        case "ZONE 8":
        case "ZONE 9":
        case "ZONE 10":
        case "ZONE 11":
            fee = 500;
            break;
        default:
            fee = 0; // Default to 0 if no valid region selected
    }


    setShippingFee(fee); // Set the shipping fee in the state
    calculateTotalPrice(fee); // Recalculate total price after updating the shipping fee
};
const calculateTotalPrice = (shippingFee) => {
  const itemTotal = cart.reduce((total, item) => {
      const itemPriceWithCustomization = item.price + calculateCustomizationCharge(item);
      return total + itemPriceWithCustomization * item.quantity;
  }, 0);


  const packagingFee = 50;
  let finalTotal = discountedTotal || itemTotal; // Use discounted total if available


  finalTotal += shippingFee + packagingFee;


  // Apply customization discount
  if (customizationDiscount) {
      finalTotal -= customizationDiscount;  // Subtract the discount
  }


  setItemTotal(itemTotal); // This should reflect the total before shipping and packaging
  setTotalPrice(finalTotal); // Update the total price
  setLoading(false);
  console.log("Item Total:", itemTotal);
  console.log("Shipping Fee:", shippingFee);
  console.log("Final Total:", finalTotal);
};
 


const handlePayNow = async () => {
  const orderData = {
      cart: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          size: item.size || 'N/A',
          edition: item.edition || 'N/A',
          customName: item.customName || '',
          customNumber: item.customNumber || '',
          fontType: item.fontType || '',
          badge: item.badge || '',
          price: item.price
      })),
      delivery_details: {
          name: formData.name,
          phone: formData.phoneNumber,
          location: formData.physicalAddress,
          region: formData.region,
      },
      total_price: totalPrice,  // Ensure totalPrice is included here
  };


  try {
      const response = await fetch("http://127.0.0.1:5000/orders", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
      });


      const data = await response.json();


      if (data.success) {
          alert("Order placed successfully!");
          navigate("/payment", { state: { totalPrice: totalPrice, formData, cartItems: cart } }); // Pass totalPrice here
      } else {
          alert("Failed to place order: " + data.message);
      }
  } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
  }
};


  return (
    <>
      <ProductDetailsHeader />
      <div className="container-fluid mt-5 p-4" style={{ backgroundColor: "#ffecd1", minHeight: "100vh" }}>
        <div className="row">
          {/* Shipping Address and Shipping Region Section (Left side) */}
          <div className="col-12">
            {/* Shipping Address Section */}
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#007bff" }}>Shipping Address</h2>
            <div className="row g-3">
              <div className="col-12">
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="form-control p-3"
                  placeholder="Enter your name"
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  name="location"
                  value={formData.physicalAddress}
                  onChange={handleChange}
                  className="form-control p-3"
                  placeholder="Enter your address"
                />
                {formErrors.physicalAddress && <small className="text-danger">{formErrors.physicalAddress}</small>}
              </div>
              <div className="col-12">
                <input
                  type="text"
                  name="phone"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-control p-3"
                  placeholder="Enter your phone number"
                />
                {formErrors.phoneNumber && <small className="text-danger">{formErrors.phoneNumber}</small>}
              </div>
              <div className="col-6">
                <input
                  type="text"
                  name="apartment"
                  placeholder="Apartment, Suite etc. (Optional)"
                  onChange={handleChange}
                  className="form-control p-3"
                  style={{ borderColor: "#007bff" }}
                />
              </div>
            </div>


            {/* Shipping Region Section */}
            <h3 className="text-lg font-medium mt-6" style={{ color: "#007bff" }}>Shipping Region</h3>
            <select
              name="region"
              onChange={handleChange}
              className="form-select p-3"
              style={{ borderColor: "#007bff" }}
              value={formData.region}
            >
              <option value="">Select Region</option>
              <option value="Nairobi CBD">Nairobi CBD / Town - KES 100</option>
              <option value="Public Means">Public Means (Matatu) - KES 300</option>
              <option value="ZONE 1">ZONE 1: Upper-Hill, Statehouse, Parklands, Pangani, Mbagathi Way, Strathmore Uni - KES 300</option>
              <option value="ZONE 2">ZONE 2: Kileleshwa, Kilimani, Adams Arcade, Jamhuri, Hurlingham, Junction Mall, Westlands, Waiyaki Way, Lavington - KES 300</option>
              <option value="ZONE 3">ZONE 3: Madaraka, Nairobi West, South B, South C, Langata, Kenyatta Market - KES 300</option>
              <option value="ZONE 4">ZONE 4: KCA, Roysambu, Zimmerman, Kahawa Sukari/West, Ngumba Estate, Roasters, Muthaiga - KES 700</option>
              <option value="ZONE 5">ZONE 5: Kasarani, USIU, Windsor, Mountain View, Mirema, Two Rivers, Village Market - KES 500</option>
              <option value="ZONE 6">ZONE 6 (Suburbs): Karen, Utawala, Embakasi, Fedha, Kiambu Road, Thome, Gigiri Nyayo Estate, Kayole, Uthiru - KES 800</option>
              <option value="ZONE 7">ZONE 7: Buruburu, Donholm, Loresho, Kibera, Kawangware, Umoja - KES 500</option>
              <option value="ZONE 8">ZONE 8 (Upcountry): Kisumu, Nanyuki, Migori, Kapsabet, Eldoret, Kericho, Homabay, Nakuru, Isiolo, Lodwar, Machakos, Mombasa - KES 400</option>
              <option value="ZONE 9">ZONE 9 (Eastern): Moyale, Garissa, Wajir - KES 600</option>
              <option value="ZONE 10">ZONE 10 (Eastern): Isiolo - KES 400</option>
              <option value="ZONE 11">ZONE 11 (North Rift): Lodwar - KES 500</option>
            </select>
            {formErrors.region && <small className="text-danger">{formErrors.region}</small>}
          </div>


            {/* Item Details and Summary Section */}
            <div className="col-md-6">
            <div className="row">
              {/* Item Details */}
              <div className="col-md-12">
                    <div className="card p-3" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                      <div className="card-body">
                        <h5 className="card-title" style={{ color: "#007bff" }}>Item Details</h5>
                        {cart.map((item, index) => {
                    // Calculate item price including customizations
                    const itemPriceWithCustomization = item.price + calculateCustomizationCharge(item);
                    const totalItemPrice = (item.quantity * itemPriceWithCustomization).toFixed(2);
                    return (
                      <div key={index} className="d-flex align-items-center p-3 mb-3" style={{
                        border: "1px solid #ddd", borderRadius: "10px", background: "#f8f9fa"
                      }}>
                        <div style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }} />
                        </div>
                        <div className="px-3 flex-grow-1">
                          <strong>{item.name}</strong>
                          <p className="mb-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="px-3 flex-grow-1">
                          <p className="mb-1">Size: {item.size || 'N/A'}</p>
                          <p className="mb-1">Edition: {item.edition || 'N/A'}</p>
                          {/* Customization Details */}
                          <div className="dropdown">
                            <button className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown">
                              More Details
                            </button>
                            <div className="dropdown-menu p-2">
                              {item.customName && <p className="mb-1">Custom Name: {item.customName}</p>}
                              {item.customNumber && <p className="mb-1">Custom Number: {item.customNumber}</p>}
                              {item.fontType && <p className="mb-1">Font Type: {item.fontType}</p>}
                              {item.badge && <p className="mb-1">Badge: {item.badge}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-weight-bold">
                        <p className="mb-0 text-muted">
                                    Total: KES {totalPrice} {/* Dynamically show the calculated price */}
                                  </p>


                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Summary Section */}
          <div className="col-12 mt-4">
            <div className="card" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <div className="card-body text-center text-md-left">
                <h5 className="card-title" style={{ color: "#007bff" }}>Summary</h5>
                <p>Shipping Fee: KES {shippingFee}</p>
                <p>Packaging Fee: KES 50</p>
                <p>Total: KES {totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Payment Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium" style={{ color: "#007bff" }}>Payment</h3>
          <form onSubmit={handlePayment}>
            <input
              type="text"
              placeholder="Enter your phone number (07...)"
              value={paymentPhoneNumber}
              onChange={(e) => setPaymentPhoneNumber(e.target.value)}
              className="form-control p-3 mb-3"
            />
            <button type="submit" className="btn btn-primary w-100 p-3" disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

