import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ShippingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    physicalAddress: "",
    city: "",
    county: "",
    postalCode: "",
    apartment: "",
    phoneNumber: "",  // Added for mobile money
    region: "",  // Added to store selected region
  });

  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Jersey",
      price: 1500,
      image_url: "path/to/image.jpg",
      quantity: 2,
    },
  ]);

  const [shippingFee, setShippingFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "region") {
      calculateShippingFee(e.target.value);
    }
  };

  // Calculate Shipping Fee based on region
  const calculateShippingFee = (region) => {
    let fee = 0;
    switch (region) {
      case "Nairobi CBD":
        fee = 100;
        break;
      case "Public Means":
        fee = 300;
        break;
      case "ZONE 1":
        fee = 300;
        break;
      default:
        fee = 0;
    }
    setShippingFee(fee);
    calculateTotalPrice(fee);
  };

  // Calculate Total Price (Item Total + Shipping Fee + Packaging Fee)
  const calculateTotalPrice = (shippingFee) => {
    const itemTotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const packagingFee = 50; // Fixed packaging fee
    setTotalPrice(itemTotal + shippingFee + packagingFee);
  };

  const handlePayNow = () => {
    navigate("/checkout");
  };

  return (
    <div className="container mt-5 p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Shipping Address Section */}
      <div className="row">
        <div className="col-md-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: "#007bff" }}>Shipping Address</h2>
          <div className="row g-3">
            {/* Shipping form fields */}
            <div className="col-12">
              <input
                type="text"
                name="physicalAddress"
                placeholder="Physical Address"
                onChange={handleChange}
                className="form-control p-3"
                style={{ borderColor: "#007bff" }}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                name="city"
                placeholder="City"
                onChange={handleChange}
                className="form-control p-3"
                style={{ borderColor: "#007bff" }}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                name="county"
                placeholder="County"
                onChange={handleChange}
                className="form-control p-3"
                style={{ borderColor: "#007bff" }}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                onChange={handleChange}
                className="form-control p-3"
                style={{ borderColor: "#007bff" }}
              />
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
        </div>

        {/* Shipping Region Section */}
        <div className="col-md-6">
          <h3 className="text-lg font-medium mt-6" style={{ color: "#007bff" }}>Shipping Region</h3>
          <select
            name="region"
            onChange={handleChange}
            className="form-select p-3"
            style={{ borderColor: "#007bff" }}
          >
            <option value="">Select Region</option>
            <option value="Nairobi CBD">Nairobi CBD / Town - KES 100</option>
            <option value="Public Means">Public Means (Matatu) - KES 300</option>
            <option value="ZONE 1">ZONE 1 - KES 300</option>
          </select>
        </div>
      </div>

      {/* Cart Details and Total Section */}
      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: "#007bff" }}>Item Details</h5>
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-3">
                  <img src={item.image_url} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                  <div>
                    <p className="mb-0">{item.name}</p>
                    <p className="mb-0">KES {item.price}</p>
                  </div>
                  <div>
                    <p className="mb-0">Quantity: {item.quantity}</p>
                    <p className="mb-0">
                      Subtotal: KES {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Price and Shipping Fee Section */}
        <div className="col-md-6">
          <div className="card" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: "#007bff" }}>Summary</h5>
              <p>Item Total: KES {cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
              <p>Shipping Fee: KES {shippingFee}</p>
              <p>Packaging Fee: KES 50</p>
              <hr />
              <h6>Total Price: KES {totalPrice.toFixed(2)}</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <button
        onClick={handlePayNow}
        className="mt-6 w-100 btn btn-primary p-3"
        style={{ backgroundColor: "#007bff", borderColor: "#007bff", color: "#fff" }}
      >
        Pay Now
      </button>
    </div>
  );
}
