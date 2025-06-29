import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import ProductDetailsHeader from "./detail/ProductDetailsHeader";
import "./Productlist.css";

function FilterMenuLeft({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <ul className="list-group list-group-flush rounded">
      <li className="list-group-item  d-lg-block">
        <h5 className="mt-1 mb-2">Browse by Category</h5>
        <div className="d-flex flex-wrap my-2">
          {categories.map((category, i) => (
            <button
              key={i}
              className={`btn btn-sm btn-outline-dark rounded-pill me-2 mb-2 ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </li>
    </ul>
  );
}

function ProductList() {
  const [viewType, setViewType] = useState({ grid: true });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All Products"]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  useEffect(() => {
    fetch("https://donjerseysporthouseco.co.ke/backend/api/products/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories([
          "All Products",
          ...data.map((category) => category.category_name), // Match backend key
        ]);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("https://donjerseysporthouseco.co.ke/backend/api/products/products")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Products:", data);  // Debugging step
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);
  

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "All Products") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category.name === selectedCategory
    
      
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  // Search products
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else if (selectedCategory !== "All Products") {
      const filtered = products.filter(
        (product) => product.category?.name === selectedCategory
      );
      
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, selectedCategory, products]);

  function changeViewType() {
    setViewType({
      grid: !viewType.grid,
    });
  }

  return (
    <>
      <ProductDetailsHeader />
      <div className="container-full-width">
        <div className="main-content-container mt-5 py-4 px-xl-5">
          <ScrollToTopOnMount />

          {/* Filter Menu for Categories */}
          <div className="row mb-4 mt-lg-3">
            <div className="col-lg-3  d-lg-block">
              <div className="border rounded shadow-sm">
                <FilterMenuLeft
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </div>
            </div>

            {/* Main Product Listing */}
            <div className="col-lg-9">
              <div className="d-flex flex-column h-100">
                {/* Search and View Type Controls */}
                <div className="row mb-3">
                  <div className="col-lg-9 col-xl-5 offset-xl-4 d-flex flex-row">
                    <div className="input-group">
                      <input
                        className="form-control bg-orange"
                        type="text"
                        placeholder="Search products..."
                        aria-label="search input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-outline-dark">
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                    </div>
                    <button
                      className="btn btn-outline-dark ms-2 d-none d-lg-inline"
                      onClick={changeViewType}
                    >
                      <FontAwesomeIcon
                        icon={viewType.grid ? "th-list" : "th-large"}
                      />
                    </button>
                  </div>
                </div>

                {/* Product Cards */}
                <div
                  className={
                    "row row-cols-1 row-cols-md-2 row-cols-lg-2 g-3 mb-4 flex-shrink-0 " +
                    (viewType.grid ? "row-cols-xl-3" : "row-cols-xl-2")
                  }
                >
   {filteredProducts.length > 0 ? (
  filteredProducts.map((product) => {
    const allSizesSoldOut =
    !product.variants || 
    product.variants.length === 0 || 
    product.variants.every((variant) => Number(variant.stock) === 0);
  
    console.log("Checking product:", product.name);
    console.log("Product Variants:", product.variants);
    console.log("All Sizes Sold Out:", allSizesSoldOut);

    return (
      <div key={product.id} className="col">
        <div className="card product-card shadow-sm hover-effect position-relative">
          {/* Sold Out Banner */}
          {allSizesSoldOut && (
            <div className="sold-out-overlay">
              <span className="sold-out-text">Sold Out</span>
            </div>
          )}

          {/* Product Image with Link */}
          <Link
            to={!allSizesSoldOut ? `/products/${product.id}` : "#"}
            state={product}
            className={!allSizesSoldOut ? "" : "disabled-link"}
          >
            <img
              className="card-img-top product-image"
              alt={product.name}
              src={product.image_url || "/default-placeholder.jpg"}
            />
          </Link>

          <div className="card-body text-center">
            <h5 className="product-name">{product.name}</h5>
            <p className="product-price">{product.price} Ksh</p>
            {!allSizesSoldOut ? (
              <Link to={`/products/${product.id}`} state={product}>
                <FaEye className="view-details-icon" /> View Details
              </Link>
            ) : (
              <span className="sold-out-message">Sold Out</span>
            )}
          </div>
        </div>
      </div>
    );
  })
) : (
  <p className="text-center">No products available.</p>
)}


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductList;
