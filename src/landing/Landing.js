import { useEffect, useState } from "react";
import Banner from "./Banner";
import FeatureProduct from "./FeatureProduct";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./landing.css";
import { Link } from "react-router-dom";
import Header from "../template/Header";
import Footer from "../template/Footer";
import axios from 'axios';
import Casey from './images/Casey.jpeg';
import Alex from './images/Alex.jpeg';
import Jordan from './images/Jordan.jpeg';

function Landing() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('https://donjerseyssporthouseserver-5-cmus.onrender.com/products?limit=6&sort=created_at_desc')
      .then(response => {
        setProducts(response.data); 
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  }, []); // runs once on mount

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
      <div className="containern bg-orange pb-5 px-lg-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-md-5 mx-auto">
          {products.length > 0 ? products.map(product => (
            <FeatureProduct
              product={product}
              key={product.id}
              id={product.id}
              image={product.image_url} 
              team={product.team}
              name={product.name}
              price={product.price}
            />
          )) : <p>Loading...</p>}
        </div>
      </div>

      {/* About Us Section */}
      <section className="about-us-section py-5">
        <div className="container text-center">
          <h2>About Us</h2>
          <p>Welcome to DonJerseys! We’re passionate about bringing high-quality sportswear and jerseys to fans worldwide. Join us to discover top-notch products and be part of our community.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                  What is the return policy?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  You can return products within 30 days of purchase.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTwo">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  How long does delivery take?
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Delivery typically takes 3-5 business days within Nairobi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Testimonials Section */}
            <section className="testimonials-section py-5">
        <div className="container text-center">
          <h2>What Our Customers Say</h2>
          <div className="row">
            <div className="col-md-4 testimonial">
              <img src={Alex} alt="Alex" className="testimonial-img" />
              <p>"Great quality jerseys! Fast delivery and excellent customer service."</p>
              <p className="text-muted">- Alex, Verified Buyer</p>
            </div>
            <div className="col-md-4 testimonial">
              <img src={Jordan} alt="Jordan" className="testimonial-img" />
              <p>"The best place to get your favorite team's kit. Highly recommend!"</p>
              <p className="text-muted">- Jordan, Verified Buyer</p>
            </div>
            <div className="col-md-4 testimonial">
              <img src={Casey} alt="Casey" className="testimonial-img" />
              <p>"Excellent experience. The products are authentic and high quality!"</p>
              <p className="text-muted">- Casey, Verified Buyer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="newsletter-section py-5 bg-light">
        <div className="container text-center">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter to receive the latest news and exclusive offers.</p>
          <form className="d-flex justify-content-center">
            <input type="email" placeholder="Enter your email" className="form-control w-50 me-2" />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Socials Section */}
      <div className="d-flex flex-column bg-orange py-4">
        <h5 className="text-center mb-3">Follow us on</h5>
        <div className="d-flex justify-content-center">
          <a href="https://www.facebook.com/share/CqwB5khNSw5mJ4Km/" className="me-3" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", "facebook"]} size="2x" />
          </a>
          <a href="https://www.instagram.com/don_jersey_sportshouse?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", "instagram"]} size="2x" />
          </a>
          <a href="https://x.com/_Its_Dickie?t=4r4yFhC7La4huG1dvkea3A&s=09" className="ms-3" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", "twitter"]} size="2x" />
          </a>
          <a href="https://www.tiktok.com/@don_jersey_sportshouse?_t=8qoEEjvusxq&_r=1" className="ms-3" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", "tiktok"]} size="2x" />
          </a>
        </div>
      </div>

      {/* <Footer /> */}
    </>
  );
}

export default Landing;
