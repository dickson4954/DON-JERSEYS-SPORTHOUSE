import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import "../Assets/PaymentPage.css";

function PaymentPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  

  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };  // Get cartItems from state
  const navigate = useNavigate();

  // Validate phone number
  const validatePhoneNumber = (number) => {
    // Check if phone number starts with 254 and is 12 digits long
    return /^254\d{9}$/.test(number);
  };

  // Handle the payment request
  const handlePayment = async (event) => {
    event.preventDefault();

    // Ensure phone number and amount are provided
    if (!phoneNumber || !paymentAmount) {
      alert('Please enter both phone number and payment amount.');
      return;
    }

    // Validate the phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Kenyan phone number starting with 254.');
      return;
    }

    setLoading(true);
    try {
      // Send the payment data to the backend
      const response = await axios.post('http://127.0.0.1:5000/pay', {
        phone_number: phoneNumber.trim(),
        amount: paymentAmount,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Handle the response from the backend
      if (response.data.CheckoutRequestID) {
        alert('Payment request sent successfully! Please check your phone to complete the payment.');
        navigate('/my-tickets', { state: { paymentSuccess: true, cartItems } });  // Redirect to MyTicket with cartItems
      } else {
        alert('Payment initiation failed. Please try again.');
      }
    } catch (error) {
      // Handle errors during the payment request
      if (error.response) {
        console.error('Payment error response:', error.response.data);
        alert(error.response.data.error || 'An error occurred while initiating payment. Please try again.');
      } else {
        console.error('Payment error:', error);
        alert('An error occurred while initiating payment. Please try again.');
      }
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setPhoneNumber('');
    setPaymentAmount('');
    navigate('/products', { state: { cartItems: [] } });  // Optionally pass empty cartItems
  };

  return (
    <div className="payment-page">
      <h1>Payment Page</h1>
      <form onSubmit={handlePayment} className="payment-form">
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          disabled={loading}  // Disable input while loading
        />
        <input
          type="number"
          placeholder="Amount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          required
          disabled={loading}  // Disable input while loading
        />
        <button type="submit" className="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
        <button type="button" className="cancel" onClick={handleCancel} disabled={loading}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default PaymentPage;
