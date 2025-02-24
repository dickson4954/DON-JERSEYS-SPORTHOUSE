import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../CartContext";
import ProductDetailsHeader from "../products/detail/ProductDetailsHeader";
import axios from "axios";
import { useLocation } from "react-router-dom";
import './ShippingPage.css'


export default function ShippingPage() {
  const navigate = useNavigate();
  const { cart, setCart } = useContext(CartContext); // Fetching cart and setCart from CartContext
  const [formData, setFormData] = useState({
    physicalAddress: "",
    phoneNumber: "",
    region: "",
    id_number: "", // Add this
    name: "", // Ensure name is included
    apartment: "", // Ensure apartment is included
  });


  const [shippingFee, setShippingFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [itemTotal, setItemTotal] = useState(0);
  const [customizationDiscount] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // To track payment and order status


  const location = useLocation();
  const formDataFromCart = location.state || {};


  // Initialize form data and calculate total price on component mount
  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      physicalAddress: formDataFromCart.location || "",
      phoneNumber: formDataFromCart.phone || "",
      name: formDataFromCart.name || "",
      region: formDataFromCart.region || "",
      id_number: formDataFromCart.id_number || "",
      apartment: formDataFromCart.apartment || "",
    }));


    if (formDataFromCart?.discountedTotal) {
      setDiscountedTotal(formDataFromCart.discountedTotal);
      setTotalPrice(formDataFromCart.discountedTotal);
    } else {
      calculateTotalPrice(shippingFee);
    }
  }, [formDataFromCart, shippingFee]);


  // Validate phone number for payment
  const validatePhoneNumber = (number) => {
    return /^07\d{8}$/.test(number);
  };


  // Handle payment submission
  const handlePayment = async (event) => {
    event.preventDefault();


    if (!paymentPhoneNumber) {
      alert("Please enter your phone number.");
      return;
    }


    if (!validatePhoneNumber(paymentPhoneNumber)) {
      alert("Please enter a valid Kenyan phone number starting with 07.");
      return;
    }


    if (totalPrice === undefined || totalPrice <= 0) {
      alert("Total price is invalid. Please check your order.");
      return;
    }


    setLoading(true);
    setPaymentStatus(null); // Reset payment status


    try {
      // Step 1: Initiate payment
      const paymentResponse = await axios.post("https://donjerseyssporthouseserver-5-cmus.onrender.com/pay", {
        phone_number: paymentPhoneNumber,
        amount: totalPrice,
      });


      // Check if payment initiation was successful
      if (paymentResponse.data.CheckoutRequestID) {
        setPaymentStatus("payment_success");


        // Step 2: Place the order only if payment is successful
        const orderResponse = await handlePayNow();


        // Check if the order was successfully placed
        if (orderResponse && orderResponse.success) {
          setPaymentStatus("order_success");
          // Reset form and cart after successful order placement
          setFormData({
            physicalAddress: "",
            phoneNumber: "",
            region: "",
            id_number: "",
            name: "",
            apartment: "",
          });
          setPaymentPhoneNumber("");
          setCart([]); // Clear the cart
        } else {
          setPaymentStatus("order_failed");
        }
      } else {
        setPaymentStatus("payment_failed");
      }
    } catch (error) {
      console.error("Error during payment or order placement:", error);
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };


  // Function to post order data to the /orders route
  const handlePayNow = async () => {
    // Ensure cart is not empty
    if (!cart || cart.length === 0) {
      console.error("Cart is empty. Cannot place order.");
      throw new Error("Cart is empty. Cannot place order.");
    }
  
    // Ensure formData is not empty
    if (!formData || Object.keys(formData).length === 0) {
      console.error("Form data is empty. Cannot place order.");
      throw new Error("Form data is empty. Cannot place order.");
    }
  
    const orderData = {
      cart: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size || "N/A",
        edition: item.edition || "N/A",
        customName: item.customName || "",
        customNumber: item.customNumber || "",
        fontType: item.fontType || "",
        badge: item.badge || "",
        price: item.price,
      })),
      shipping_details: {
        name: formData.name?.trim() || "",
        phone: formData.phoneNumber?.trim() || "",
        location: formData.physicalAddress?.trim() || "",
        region: formData.region && formData.region.trim() ? formData.region.trim() : "N/A",
        id_number: formData.id_number?.trim() || "",
      },
      total_price: totalPrice,
    };
  
    console.log("Order Data to be Posted:", orderData);
  
    try {
      const response = await fetch("https://donjerseyssporthouseserver-5-cmus.onrender.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        console.log("Order placed successfully:", data);
        return data; // Return the successful response
      } else {
        throw new Error(data.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };


  // Calculate customization charge for an item
  const calculateCustomizationCharge = (item) => {
    let customizationCharge = 0;
    if (item.customName) customizationCharge += 200;
    if (item.customNumber) customizationCharge += 200;
    if (item.badge) customizationCharge += 100;
    return customizationCharge;
  };


  // Calculate shipping fee based on region
  const calculateShippingFee = (region) => {
    let fee = 0;
    switch (region) {
      case "Nairobi CBD":
        fee = 0;
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
        fee = 0;
    }
    setShippingFee(fee);
    calculateTotalPrice(fee);
  };


  // Calculate total price including shipping and packaging
  const calculateTotalPrice = (shippingFee) => {
    const itemTotal = cart.reduce((total, item) => {
      const itemPriceWithCustomization = item.price + calculateCustomizationCharge(item);
      return total + itemPriceWithCustomization * item.quantity;
    }, 0);


    const packagingFee = 50;
    let finalTotal = discountedTotal || itemTotal;
    finalTotal += shippingFee + packagingFee;


    if (customizationDiscount) {
      finalTotal -= customizationDiscount;
    }


    setItemTotal(itemTotal);
    setTotalPrice(finalTotal);
    setLoading(false);
  };


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === "region") {
      calculateShippingFee(value);
    }
  };


  // Validate form inputs
  const validateForm = () => {
    let errors = {};
    if (!formData.physicalAddress) errors.physicalAddress = "Physical address is required.";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required.";
    if (!formData.region) errors.region = "Region must be selected.";
    if (!formData.apartment) errors.apartment = "Apartment is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  return (
    <>
      <ProductDetailsHeader />
      <div className="container-fluid mt-5 p-4" style={{ backgroundColor: "#ffecd1", minHeight: "100vh" }}>
        <div className="row">
          {/* Shipping Address and Shipping Region Section */}
          <div className="col-12">
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
                  name="physicalAddress"
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
                  name="phoneNumber"
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
              value={formData.region || ""}
            >
              <option value="">Select Region</option>
              <option value="Nairobi CBD">Nairobi CBD / Town - KES 0</option>
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
          <div className="p-3 col-12 col-md-6">
            <div className="row">
              {/* Item Details */}
              <div className="col-md-12">
                <div className="card p-3" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: "#007bff" }}>Item Details</h5>


                    {cart.map((item, index) => {
                      const itemPriceWithCustomization = item.price + calculateCustomizationCharge(item);
                      const totalItemPrice = (item.quantity * itemPriceWithCustomization).toFixed(2);


                      return (
                        <div key={index} className="d-flex flex-column flex-md-row align-items-center p-3 mb-3" style={{
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          background: "#f8f9fa",
                          overflow: "hidden",
                          width: "100%"
                        }}>
                          {/* Product Image */}
                          <div style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }}
                            />
                          </div>


                          {/* Product Details */}
                          <div className="px-3 flex-grow-1 text-center text-md-left w-100">
                            <strong>{item.name}</strong>
                            <p className="mb-1">Quantity: {item.quantity}</p>
                            <p className="mb-1">Size: {item.size || 'N/A'}</p>
                            <p className="mb-1">Edition: {item.edition || 'N/A'}</p>


                            {/* Customization Dropdown */}
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
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


                          {/* Total Price Section */}
                          <div className="text-center text-md-right w-100 mt-2 font-weight-bold">
                            <p className="mb-0 text-muted">
                              Total: KES {totalItemPrice}
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
          <h3 className="text-lg font-medium" style={{ color: "#34B233" }}>Payment</h3>
          <form onSubmit={handlePayment}>
            <input
              type="text"
              placeholder="Enter your phone number (07...)"
              value={paymentPhoneNumber}
              onChange={(e) => setPaymentPhoneNumber(e.target.value)}
              className="form-control p-3 mb-3"
            />
            <button type="submit" className="pay-btn w-100 p-3" disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>
        </div>


        {/* Payment Status Messages */}
        {paymentStatus === "payment_success" && (
          <div className="alert alert-success mt-4">
            Payment initiated successfully! Processing your order...
          </div>
        )}
        {paymentStatus === "order_success" && (
          <div className="alert alert-success mt-4">
            Order placed successfully! Thank you for your purchase.
          </div>
        )}
        {paymentStatus === "payment_failed" && (
          <div className="alert alert-danger mt-4">
            Payment initiation failed. Please try again.
          </div>
        )}
        {paymentStatus === "order_failed" && (
          <div className="alert alert-danger mt-4">
            Failed to place order. Please contact support.
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="alert alert-danger mt-4">
            An error occurred. Please try again or contact support.
          </div>
        )}
      </div>
    </>
  );
}

