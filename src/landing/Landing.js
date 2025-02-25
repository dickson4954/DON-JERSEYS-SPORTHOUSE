import { useEffect, useState } from "react";
import Banner from "./Banner";
import FeatureProduct from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./landing.css";
import { Link, useLocation } from "react-router-dom";
import Header from "../template/Header";
import Footer from "../template/Footer";
import axios from 'axios';
import Casey from './images/Casey.jpeg';
import Alex from './images/Alex.jpeg';
import Jordan from './images/Jordan.jpeg';

function Landing() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    axios.get('https://donjerseyssporthouseserver-5-cmus.onrender.com/products?limit=6&sort=created_at_desc')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data); // Initialize filtered products
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  }, []);

  useEffect(() => {
    // Extract search query from URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products); // Reset to all products if no search query
    }
  }, [location.search, products]);

  return (
    <>
      <Header />
      <ScrollToTopOnMount />
      <Banner />

      <div className="d-flex flex-column bg-orange py-4">
        <p className="text-center px-5 text-danger">We are Located at Nairobi CBD.</p>
        <div className="d-flex justify-content-center">
          <Link to="/products" className="btn btn-primary" replace>
            Browse products
          </Link>
        </div>
      </div>

      <h2 className="text-muted text-center new-arrival-title">New Arrival</h2>
      <div id="products-section" className="containern bg-orange pb-5 px-lg-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-md-5 mx-auto">
          {filteredProducts.length > 0 ? filteredProducts.map(product => (
            <FeatureProduct
              product={product}
              key={product.id}
              id={product.id}
              image={product.image_url}
              team={product.team}
              name={product.name}
              price={product.price}
            />
          )) : <p>No products found.</p>}
        </div>
        </div>

      {/* Rest of the Landing component remains unchanged */}
    </>
  );
}

export default Landing;