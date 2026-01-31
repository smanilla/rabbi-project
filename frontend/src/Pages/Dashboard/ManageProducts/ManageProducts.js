import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Alert,
} from "react-bootstrap";
import API_BASE_URL from "../../../config/api";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    img: "",
    price: "",
    originalPrice: "",
    descrip: "",
    category: "",
    featured: false,
    stock: "",
    variations: [],
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data.products || data);
    } catch (error) {
      showAlert("Error fetching products", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      img: "",
      price: "",
      originalPrice: "",
      descrip: "",
      category: "",
      featured: false,
      stock: "",
      variations: [],
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      img: product.img || product.image || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      descrip: product.descrip || product.description || "",
      category: product.category || "",
      featured: product.featured || false,
      stock: product.stock || "",
      variations: product.variations || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      // Note: You'll need to add DELETE endpoint to backend
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showAlert("Product deleted successfully", "success");
        fetchProducts();
      } else {
        showAlert("Error deleting product", "danger");
      }
    } catch (error) {
      showAlert("Error deleting product", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.img || !formData.img.trim()) {
      showAlert("Please set a product image (URL or upload)", "danger");
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      let response;
      if (editingProduct) {
        // Update existing product
        response = await fetch(
          `${API_BASE_URL}/products/${editingProduct._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          }
        );
      } else {
        // Create new product
        response = await fetch(`${API_BASE_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (response.ok || data.success) {
        showAlert(
          editingProduct
            ? "Product updated successfully"
            : "Product added successfully",
          "success"
        );
        setShowModal(false);
        fetchProducts();
      } else {
        showAlert(data.error || "Error saving product", "danger");
      }
    } catch (error) {
      showAlert("Error saving product", "danger");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      showAlert("Please select an image file (JPEG, PNG, etc.)", "danger");
      return;
    }
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setFormData((prev) => ({ ...prev, img: data.imageUrl }));
        showAlert("Image uploaded. You can save the product.", "success");
      } else {
        showAlert(data.error || "Upload failed", "danger");
      }
    } catch (err) {
      showAlert("Failed to upload image", "danger");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="manage-products">
      <Container>
        <div className="page-header">
          <h2>Manage Products</h2>
          <Button variant="primary" onClick={handleAddNew}>
            + Add New Product
          </Button>
        </div>

        {alert.show && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })}>
            {alert.message}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">Loading products...</div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.img || product.image}
                          alt={product.title}
                          className="product-thumb"
                        />
                      </td>
                      <td>{product.title}</td>
                      <td>
                        <Badge bg="secondary">
                          {product.category || "Uncategorized"}
                        </Badge>
                      </td>
                      <td>৳{product.price?.toLocaleString('en-BD') || "0"}</td>
                      <td>{product.stock || "N/A"}</td>
                      <td>
                        {product.featured ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="secondary">No</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
                <Form.Label>Drone / Product Image *</Form.Label>
                <Form.Control
                  type="url"
                  name="img"
                  value={formData.img}
                  onChange={handleInputChange}
                  placeholder="https://example.com/drone.jpg or upload below"
                />
                <div className="mt-2 mb-2">
                  <Form.Label className="small text-muted">Or upload image (max 5MB)</Form.Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="form-control"
                  />
                  {uploadingImage && <span className="small text-muted">Uploading…</span>}
                </div>
                {formData.img && (
                  <img
                    src={formData.img}
                    alt="Preview"
                    className="img-preview mt-2"
                  />
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
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descrip"
                  value={formData.descrip}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default ManageProducts;
