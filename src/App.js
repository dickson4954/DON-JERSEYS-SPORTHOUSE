import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './template/Header';
import Footer from './template/Footer';
import ProductDetail from './products/detail/ProductDetail';
import Landing from './landing/Landing';
import ProductList from './products/ProductList';
import AdminDashboard from './admin/AdminDashboard';
import LoginPage from './admin/LoginPage';
import ProductDetailsHeader from './products/detail/ProductDetailsHeader';
import OrderForm from './orders/OrderForm'; 
import { CartProvider } from './CartContext'; 
import Cart from './orders/Cart';
import PaymentPage from './orders/paymentpage';
import ShippingPage from './orders/ShippingPage';


function App() {
  return (
    <CartProvider>
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Header />
              <Landing />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/products" 
          element={
            <>
              <Header />
              <ProductList />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={<AdminDashboard />} 
        />
        <Route 
          path="/admin/login" 
          element={<LoginPage />} 
        />
        <Route 
          path="/products/:id" 
          element={
            <>
              <ProductDetailsHeader />
              <ProductDetail />
              {/* <Footer /> */}
            </>
          } 
        />
        <Route 
          path="/order-form" 
          element={<OrderForm />} 
        />
         <Route 
          path="order-payment" 
          element={<PaymentPage/>} 
        />
        <Route 
          path="/shipping-page" 
          element={<ShippingPage/>} 
        />
         <Route path="/cart" element={<Cart />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
