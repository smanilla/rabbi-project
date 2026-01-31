import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import "./AddService.css";
import API_BASE_URL from "../../../config/api";

const AddService = () => {
  const [formData, setFormData] = useState({
    title: "",
    img: "",
    price: "",
    originalPrice: "",
    descrip: "",
    category: "",
    featured: false,
    stock: "",
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "file"

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Update preview if image URL changes
    if (name === "img" && uploadMethod === "url") {
      setImagePreview(value);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showAlert("Please select an image file", "danger");
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("File size must be less than 5MB", "danger");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      showAlert("Please select a file to upload", "danger");
      return;
    }

    try {
      setUploading(true);
      const formDataToUpload = new FormData();
      formDataToUpload.append("image", selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        body: formDataToUpload,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({ ...formData, img: data.imageUrl });
        showAlert("Image uploaded successfully!", "success");
        setSelectedFile(null);
      } else {
        showAlert(data.error || "Error uploading image", "danger");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert("Error uploading image", "danger");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        showAlert("Product added successfully!", "success");
        setFormData({
          title: "",
          img: "",
          price: "",
          originalPrice: "",
          descrip: "",
          category: "",
          featured: false,
          stock: "",
        });
        setSelectedFile(null);
        setImagePreview(null);
        setUploadMethod("url");
      } else {
        showAlert(data.error || "Error adding product", "danger");
      }
    } catch (error) {
      showAlert("Error adding product", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-service">
      <Container>
        <div className="page-header">
          <h2>Add New Product</h2>
        </div>

        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ show: false })}
          >
            {alert.message}
          </Alert>
        )}

        <div className="form-container">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Drone, Camera, Accessories"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Product Image *</Form.Label>
              
              {/* Upload Method Toggle */}
              <div className="mb-3">
                <Form.Check
                  inline
                  type="radio"
                  label="Image URL"
                  name="uploadMethod"
                  checked={uploadMethod === "url"}
                  onChange={() => {
                    setUploadMethod("url");
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Upload File"
                  name="uploadMethod"
                  checked={uploadMethod === "file"}
                  onChange={() => {
                    setUploadMethod("file");
                    setFormData({ ...formData, img: "" });
                  }}
                />
              </div>

              {/* URL Input */}
              {uploadMethod === "url" && (
                <>
                  <Form.Control
                    type="url"
                    name="img"
                    value={formData.img}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.img && (
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="img-preview mt-2"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </>
              )}

              {/* File Upload */}
              {uploadMethod === "file" && (
                <>
                  <div className="file-upload-area mb-2">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="mb-2"
                    />
                    {selectedFile && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="text-muted small">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleImageUpload}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload Image"}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-preview"
                      />
                    </div>
                  )}
                  
                  {formData.img && (
                    <div className="mt-2">
                      <Alert variant="success" className="py-2 small">
                        ✅ Image uploaded: {formData.img}
                      </Alert>
                    </div>
                  )}
                </>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Original Price (for sale)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="Leave empty if not on sale"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Available quantity"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="featured"
                    label="Featured Product"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mt-4"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="descrip"
                value={formData.descrip}
                onChange={handleInputChange}
                placeholder="Enter product description"
              />
            </Form.Group>

            <div className="form-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setFormData({
                    title: "",
                    img: "",
                    price: "",
                    originalPrice: "",
                    descrip: "",
                    category: "",
                    featured: false,
                    stock: "",
                  });
                  setSelectedFile(null);
                  setImagePreview(null);
                  setUploadMethod("url");
                }}
              >
                Clear
              </Button>
              <Button variant="primary" type="submit" disabled={loading || uploading}>
                {loading ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default AddService;
