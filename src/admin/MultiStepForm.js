import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './MultiStepForm.css';

const MultiStepForm = () => {
  const [step, setStep] = useState(1); // Current step in the form
  const [formData, setFormData] = useState({
    productType: '', // 'shoe' or 'jersey'
    name: '',
    description: '',
    price: '',
    category_id: '',
    variants: [{ size: '', edition: '', stock: 0 }], // Initial variant
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState(null); // File object for image upload
  const [errors, setErrors] = useState({}); // Validation errors
  const [categories, setCategories] = useState([]); // Fetched categories

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://donjerseysporthouseco.co.ke/backend/api/products/categories');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched Categories:', data); // Debugging the response

        if (Array.isArray(data)) {
          // Map the response to match expected keys in the dropdown
          const formattedCategories = data.map(cat => ({
            id: cat.category_id, // Ensure "id" is set correctly
            name: cat.category_name, // Ensure "name" is set correctly
          }));

          setCategories(formattedCategories);
        } else {
          console.error('Unexpected data format:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Handle input changes for non-variant fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle input changes for variant fields
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [name]: value };
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    setErrors((prev) => ({ ...prev, variants: '' }));
  };

  // Add a new variant
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: '', edition: '', stock: 0 }],
    }));
  };

  // Remove a variant
  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setErrors((prev) => ({ ...prev, imageUrl: '' }));
  };

  // Validate the current step
  const validateStep = () => {
    const newErrors = {};

    // Product Details (Step 1)
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Product name is required';
      if (!formData.description) newErrors.description = 'Product description is required';
      if (formData.variants.length === 0) newErrors.variants = 'At least one variant is required';

      formData.variants.forEach((variant, index) => {
        if (!variant.size) {
          newErrors[`variants.${index}.size`] = 'Size is required';
        }
        if (variant.stock === '' || variant.stock < 0) {
          newErrors[`variants.${index}.stock`] = 'Stock must be a non-negative number';
        }
      });
    }

    // Pricing (Step 2)
    if (step === 2) {
      if (!formData.price || formData.price < 0) {
        newErrors.price = 'Price must be a non-negative number';
      }
    }

    // Category and Image (Step 3)
    if (step === 3) {
      if (!formData.category_id) newErrors.category_id = 'Category is required';
      if (!imageFile && !formData.imageUrl) newErrors.imageUrl = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to the next step
  const nextStep = () => {
    if (validateStep()) setStep((prevStep) => prevStep + 1);
  };

  // Move to the previous step
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
  
    let imageUrl = formData.imageUrl;
    if (imageFile) {
      const imageData = new FormData();
      imageData.append('file', imageFile); // Ensure the field name is 'file'
  
      try {
        const response = await fetch('https://donjerseysporthouseco.co.ke/backend/api/products/upload', {
          method: 'POST',
          body: imageData,
        });
  
        const uploadResult = await response.json();
  
        if (response.ok && uploadResult.image_url) {
          imageUrl = uploadResult.image_url;
        } else {
          console.error('Upload result:', uploadResult); // Log the result for debugging
          Swal.fire({ icon: 'error', title: 'Image Upload Failed', text: 'Please try uploading the image again.' });
          return;
        }
      } catch (error) {
        console.error('Image upload error:', error);
        Swal.fire({ icon: 'error', title: 'Image Upload Error', text: 'An error occurred while uploading the image.' });
        return;
      }
    }
  
    // Prepare payload
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id, 10), // Ensure category_id is a number
      variants: formData.variants.map((variant) => ({
        size: variant.size,
        edition: variant.edition,
        stock: parseInt(variant.stock, 10),
      })),
      imageUrl: imageUrl,
    };
  
    try {
      const productResponse = await fetch('https://donjerseysporthouseco.co.ke/backend/api/products/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (productResponse.ok) {
        Swal.fire({ icon: 'success', title: 'Product Added!', text: 'Product has been successfully added.' }).then(() => {
          window.location.reload();
        });
      } else {
        const errorData = await productResponse.json();
        Swal.fire({ icon: 'error', title: 'Failed to Add Product', text: errorData.error || 'Please check the entered details.' });
      }
    } catch (error) {
      console.error('Product submission error:', error);
      Swal.fire({ icon: 'error', title: 'Submission Error', text: 'An error occurred while submitting the product. Please try again later.' });
    }
  };
  // Render the form based on the current step
  return (
    <>
      {step === 1 && (
        <div className="form-container">
          <h2>Step 1: Product Details</h2>
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} />
          {errors.name && <p className="error">{errors.name}</p>}
          <textarea name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} />
          {errors.description && <p className="error">{errors.description}</p>}
          <h3>Variants</h3>
          {formData.variants.map((variant, index) => (
            <div key={index} className="variant">
              <input
                type="text"
                name="size"
                placeholder="Size (e.g., S, M, L, 42)"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, e)}
              />
              {errors[`variants.${index}.size`] && <p className="error">{errors[`variants.${index}.size`]}</p>}
              <input
                type="text"
                name="edition"
                placeholder="Edition (e.g., Fan Edition, Player Edition)"
                value={variant.edition}
                onChange={(e) => handleVariantChange(index, e)}
              />
              {errors[`variants.${index}.edition`] && <p className="error">{errors[`variants.${index}.edition`]}</p>}
              <input
                type="number"
                name="stock"
                placeholder="Stock Quantity"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, e)}
              />
              {errors[`variants.${index}.stock`] && <p className="error">{errors[`variants.${index}.stock`]}</p>}
              {formData.variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(index)}>Remove Variant</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addVariant}>Add Another Variant</button>
          {errors.variants && <p className="error">{errors.variants}</p>}
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="form-container">
          <h2>Step 2: Pricing</h2>
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
          {errors.price && <p className="error">{errors.price}</p>}
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div className="form-container">
          <h2>Step 3: Category and Image</h2>
          <select name="category_id" value={formData.category_id} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
          {errors.category_id && <p className="error">{errors.category_id}</p>}
          <input type="file" onChange={handleImageChange} />
          {errors.imageUrl && <p className="error">{errors.imageUrl}</p>}
          <button onClick={prevStep}>Back</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </>
  );
};

export default MultiStepForm;