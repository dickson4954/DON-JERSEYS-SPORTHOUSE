import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from 'react-icons/fa';  // Import the view details icon

import './RelatedProduct.css';

function RelatedProduct({ category_id, currentProductId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    console.log("Fetching related products for category:", category_id);
    console.log("Current product ID:", currentProductId);

    fetch(`https://donjerseysporthouseco.co.ke/backend/api/categories/${category_id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch related products.');
        }
        return response.json();
      })
      .then(data => {
        // Filter out the current product
        const filteredProducts = data.filter(product => product.id !== currentProductId);
  
        // Ensure there are no duplicate types (home, away, third)
        const uniqueProducts = [];
        const seenTypes = new Set();
  
        filteredProducts.forEach(product => {
          const productType = product.name.split(" ")[1];  // Assuming type is in the name
          if (!seenTypes.has(productType)) {
            uniqueProducts.push(product);
            seenTypes.add(productType);
          }
        });
  
        setRelatedProducts(uniqueProducts);
      })
      .catch(error => {
        console.error('Error fetching related products:', error);
      });
  }, [currentProductId, category_id]);

  return (
    <>
      {relatedProducts.length > 0 ? (
        relatedProducts.map((product) => (
          <div className="col" key={product.id}>
            <div className="card product-card shadow-sm hover-effect">
              <Link to={`/products/${product.id}`} state={{ 
                id: product.id,
                name: product.name,
                image: product.image_url,
                price: product.price,
                description: product.description,
                team: product.team 
              }}>
                <img
                  className="card-img-top cover"
                  alt={product.name}
                  src={product.image_url}
                />
              </Link>
              <div className="card-body text-center">
                <h5 className="product-name">{product.name}</h5>
                <div className="price-details-container">
                  <p className="product-price">{product.price} Ksh</p>
                  <Link
                    to={`/products/${product.id}`}
                    state={{
                      id: product.id,
                      name: product.name,
                      image: product.image_url,
                      price: product.price,
                      description: product.description,
                      team: product.team,
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
        ))
      ) : (
        <p className="text-center">No related products found.</p>
      )}
    </>
  );
}

export default RelatedProduct;
