import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import API_BASE_URL from "../../config/api";
import useAuth from "../../hooks/useAuth";

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      alert("Please login to add items to wishlist");
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
      alert("Please login to add items to cart");
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
        // Trigger a custom event to refresh cart count in Navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        alert("Added to cart!");
      } else {
        throw new Error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const originalPrice = product.originalPrice || product.price;
  const currentPrice = product.price;
  const isOnSale = originalPrice > currentPrice;
  const discount = isOnSale
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-card-inner">
        <Link to={`/products/${product._id}`} className="product-link">
          <div className="product-image-wrapper">
            {isOnSale && <span className="sale-badge">Sale!</span>}
            <img
              src={product.img || product.image}
              alt={product.title}
              className="product-image"
            />
            <div className="product-overlay">
              <button
                className="btn-quick-view"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/products/${product._id}`;
                }}
              >
                Quick View
              </button>
            </div>
          </div>
        </Link>

        <div className="product-info">
          <div className="product-category">{product.category || "Drone"}</div>
          <h3 className="product-title">
            <Link to={`/products/${product._id}`}>{product.title}</Link>
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
    </div>
  );
};

export default ProductCard;
