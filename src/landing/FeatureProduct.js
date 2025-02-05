import React from 'react';
import { Link } from "react-router-dom";
import './FeatureProduct.css';
import { FaEye } from 'react-icons/fa';

function FeatureProduct({ product, image, name, price, id }) {
  return (
    <div className="col">
      <div className="card product-card shadow-sm hover-effect">
        <Link 
          to={`/products/${id}`} 
          state={{ 
            id: product.id,
            name: product.name,
            image: product.image_url,
            price: product.price,
            description: product.description,
            team: product.team 
          }}
        >
          <div className="image-container">
            <img className="card-img-top product-image" alt={name} src={image} />
          </div>
        </Link>
        <div className="card-body text-center">
          <h5 className="product-name">{name}</h5>
          <div className="price-details-container">
            <p className="product-price">KES {price.toFixed(2)}</p>
            <Link 
              to={`/products/${id}`} 
              state={{ 
                id: product.id,
                name: product.name,
                image: product.image_url,
                price: product.price,
                description: product.description,
                team: product.team 
              }}
              className="view-details-link"
              replace
            >
              <FaEye className="view-details-icon" /> View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureProduct;
