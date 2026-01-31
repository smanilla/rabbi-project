import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ProductCard.css";
import API_BASE_URL from "../../config/api";
import useAuth from "../../hooks/useAuth";
import { toast } from "../Toast/Toast";

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      toast("Please login to add items to wishlist", "info");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          productId: product._id,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setIsWishlisted(true);
        if (onAddToWishlist) onAddToWishlist(product);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      // Silently fail - don't show error to user
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      toast("Please login to add items to cart", "info");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          product: product,
          quantity: 1,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        if (response.status === 503) {
          throw new Error("Database connection error. Please check if MongoDB is running.");
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        if (onAddToCart) onAddToCart(product);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        toast("Added to cart!");
      } else {
        throw new Error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast(error.message || "Failed to add to cart. Please try again.", "error");
    } finally {
      setIsAdding(false);
    }
  };

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
  const openQuickView = (e) => {
    e?.preventDefault?.();
    setShowQuickView(true);
  };

  return (
    <div className="product-card">
      <div className="product-card-inner">
        <Link to={`/products/${product._id}`} className="product-link">
          <div className="product-image-wrapper">
            {isOnSale && <span className="sale-badge">Sale!</span>}
            <img
              src={productImage}
              alt={productTitle}
              className="product-image"
            />
            <div className="product-overlay">
              <button
                type="button"
                className="btn-quick-view"
                onClick={openQuickView}
              >
                Quick View
              </button>
            </div>
          </div>
        </Link>

        <div className="product-info">
          <div className="product-category">{productCategory}</div>
          <h3 className="product-title">
            <Link to={`/products/${product._id}`}>{productTitle}</Link>
          </h3>
          <div className="product-rating">
            {product.averageRating ? (
              <>
                <span className="stars">
                  {"★".repeat(Math.round(product.averageRating))}
                  {"☆".repeat(5 - Math.round(product.averageRating))}
                </span>
                <span className="rating-text">
                  ({product.totalRatings || 0})
                </span>
              </>
            ) : (
              <span className="no-rating">No ratings yet</span>
            )}
          </div>
          <div className="product-price">
              {isOnSale && (
                <span className="original-price">৳{originalPrice.toLocaleString('en-BD')}</span>
              )}
              <span className="current-price">৳{currentPrice.toLocaleString('en-BD')}</span>
            {isOnSale && (
              <span className="discount-badge">-{discount}%</span>
            )}
          </div>

          <div className="product-actions">
            <button
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              className={`btn-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={handleWishlist}
              disabled={isAdding}
              title="Add to Wishlist"
            >
              ♥
            </button>
          </div>
        </div>
      </div>

      <Modal
        show={showQuickView}
        onHide={() => setShowQuickView(false)}
        centered
        size="lg"
        className="quick-view-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="quick-view-title">Quick View</Modal.Title>
        </Modal.Header>
        <Modal.Body className="quick-view-body">
          <div className="quick-view-grid">
            <div className="quick-view-image-wrap">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productTitle}
                  className="quick-view-image"
                />
              ) : (
                <div className="quick-view-placeholder">No image</div>
              )}
              {isOnSale && <span className="quick-view-sale">Sale</span>}
            </div>
            <div className="quick-view-details">
              <span className="quick-view-category">{productCategory}</span>
              <h4 className="quick-view-name">{productTitle}</h4>
              <div className="quick-view-rating">
                {product.averageRating ? (
                  <span className="stars">
                    {"★".repeat(Math.round(product.averageRating))}
                    {"☆".repeat(5 - Math.round(product.averageRating))}
                  </span>
                ) : (
                  <span className="no-rating">No ratings yet</span>
                )}
              </div>
              <div className="quick-view-price-wrap">
                {isOnSale && (
                  <span className="original-price">৳{Number(originalPrice).toLocaleString("en-BD")}</span>
                )}
                <span className="quick-view-price">৳{Number(currentPrice).toLocaleString("en-BD")}</span>
                {isOnSale && <span className="discount-badge">-{discount}%</span>}
              </div>
              <p className="quick-view-desc">{productDesc}</p>
              <div className="quick-view-actions">
                <Button
                  variant="primary"
                  className="quick-view-btn-cart"
                  onClick={(e) => {
                    handleAddToCart(e);
                    setShowQuickView(false);
                  }}
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline-secondary"
                  as={Link}
                  to={product._id ? `/products/${product._id}` : "/shop"}
                  onClick={() => setShowQuickView(false)}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductCard;
