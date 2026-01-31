import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import API_BASE_URL from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { toast } from "../../components/Toast/Toast";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (response.status === 404) {
          setNotFound(true);
          setProduct(null);
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      toast("Please login to add items to cart", "info");
      return;
    }
    if (!product) return;
    try {
      setAdding(true);
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          product,
          quantity: 1,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add to cart");
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      toast("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast(error.message || "Failed to add to cart.", "error");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading product...</p>
        </Container>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="product-detail-page product-detail-not-found">
        <Container className="py-5 text-center">
          <h2>Product not found</h2>
          <p className="text-muted mb-4">This product may have been removed or the link is invalid.</p>
          <Button as={Link} to="/shop" variant="primary">
            Back to Shop
          </Button>
        </Container>
      </div>
    );
  }

  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const currentPrice = product.price ?? 0;
  const isOnSale = originalPrice > currentPrice;
  const discount = isOnSale
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const productImage = product.img || product.image;
  const productTitle = product.title || "Product";
  const productCategory = product.category || "Drone";
  const productDesc = product.descrip || product.description || "No description available.";

  return (
    <div className="product-detail-page">
      <Container className="py-4 py-md-5">
        <Row className="product-detail-row align-items-start">
          <Col md={6} className="product-detail-image-col mb-4 mb-md-0">
            <div className="product-detail-image-wrap">
              {productImage ? (
                <img src={productImage} alt={productTitle} className="product-detail-image" />
              ) : (
                <div className="product-detail-placeholder">No image</div>
              )}
              {isOnSale && <span className="product-detail-sale">Sale</span>}
            </div>
          </Col>
          <Col md={6}>
            <span className="product-detail-category">{productCategory}</span>
            <h1 className="product-detail-title">{productTitle}</h1>
            {product.averageRating != null && (
              <div className="product-detail-rating mb-3">
                <span className="stars">
                  {"★".repeat(Math.round(product.averageRating))}
                  {"☆".repeat(5 - Math.round(product.averageRating))}
                </span>
                {product.totalRatings != null && (
                  <span className="rating-text">({product.totalRatings})</span>
                )}
              </div>
            )}
            <div className="product-detail-price-wrap mb-4">
              {isOnSale && (
                <span className="original-price">৳{Number(originalPrice).toLocaleString("en-BD")}</span>
              )}
              <span className="current-price">৳{Number(currentPrice).toLocaleString("en-BD")}</span>
              {isOnSale && <span className="discount-badge">-{discount}%</span>}
            </div>
            <p className="product-detail-desc">{productDesc}</p>
            <div className="product-detail-actions">
              <Button
                variant="primary"
                size="lg"
                className="me-2"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline-secondary" as={Link} to="/shop" size="lg">
                Continue Shopping
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductDetail;
