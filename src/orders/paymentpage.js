// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function PaymentPage() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const location = useLocation();
//   const { totalPrice, formData, cartItems } = location.state || { totalPrice: 0, formData: {}, cartItems: [] };  // Ensure defaults
//   const navigate = useNavigate();

//   // Validate phone number
//   const validatePhoneNumber = (number) => {
//     return /^254\d{9}$/.test(number);
//   };

//   // Handle the payment request
//   const handlePayment = async (event) => {
//     event.preventDefault();

//     // Check if phone number is provided
//     if (!phoneNumber) {
//       alert('Please enter your phone number.');
//       return;
//     }

//     // Validate phone number format
//     if (!validatePhoneNumber(phoneNumber)) {
//       alert('Please enter a valid Kenyan phone number starting with 254.');
//       return;
//     }

//     // Log the total price to ensure it's being passed correctly
//     console.log("Total Price:", totalPrice);

//     // Check if totalPrice is defined
//     if (totalPrice === undefined || totalPrice <= 0) {
//       alert('Total price is invalid. Please check your order.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const amountToPay = totalPrice; // Use the totalPrice directly

//       // Log the payment data being sent
//       console.log(" Payment Data:", { phone_number: phoneNumber, amount: amountToPay });

//       const response = await axios.post("http://127.0.0.1:5000/pay", {
//         phone_number: phoneNumber,
//         amount: amountToPay,
//       });

//       if (response.data.CheckoutRequestID) {
//         alert("Payment initiated successfully!");
//         // Redirect or perform further actions as needed
//       } else {
//         alert("Payment initiation failed: " + response.data.error);
//       }
//     } catch (error) {
//       console.error("Error during payment:", error);
//       alert("An error occurred while processing the payment.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Payment Page</h1>
//       <p>Total Price: {totalPrice}</p>
//       <form onSubmit={handlePayment}>
//         <input
//           type="text"
//           placeholder="Enter your phone number"
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Processing..." : "Pay Now"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default PaymentPage;


