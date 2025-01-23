import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './MultiStepForm.css';

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    variants: [
      { size: '', edition: '', stock: 0 }
    ], // Initialize with one variant
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/categories');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched Categories:', data); // Debugging the response
        if (Array.isArray(data)) {
          setCategories(data); // Ensure it's an array of objects
        } else {
          console.error('Unexpected data format:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Ensure the dropdown is not stuck
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = formData.variants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [name]: value };
      }
      return variant;
    });
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    setErrors((prev) => ({ ...prev, variants: '' }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: '', edition: '', stock: 0 }]
    }));
  };

  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setErrors((prev) => ({ ...prev, imageUrl: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Product name is required';
      if (!formData.description) newErrors.description = 'Product description is required';
      if (formData.variants.length === 0) newErrors.variants = 'At least one variant is required';
      formData.variants.forEach((variant, index) => {
        if (!variant.size) {
          newErrors[`variants.${index}.size`] = 'Size is required';
        }
        if (!variant.edition) {
          newErrors[`variants.${index}.edition`] = 'Edition is required';
        }
        if (variant.stock === '' || variant.stock < 0) {
          newErrors[`variants.${index}.stock`] = 'Stock must be a non-negative number';
        }
      });
    } else if (step === 2) {
      if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    } else if (step === 3) {
      if (!formData.category_id) newErrors.category_id = 'Category is required';
      if (!imageFile && !formData.imageUrl) newErrors.imageUrl = 'Product image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    let imageUrl = formData.imageUrl;
    if (imageFile) {
      const imageData = new FormData();
      imageData.append('file', imageFile);

      try {
        const response = await fetch('http://127.0.0.1:5000/upload', { method: 'POST', body: imageData });
        const uploadResult = await response.json();

        if (response.ok && uploadResult.image_url) {
          imageUrl = uploadResult.image_url;
        } else {
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
      category_id: formData.category_id,
      variants: formData.variants.map(variant => ({
        size: variant.size,
        edition: variant.edition,
        stock: parseInt(variant.stock, 10)
      })),
      imageUrl: imageUrl
    };

    try {
      const productResponse = await fetch('http://127.0.0.1:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
