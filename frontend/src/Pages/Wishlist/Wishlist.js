import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API_BASE_URL from "../../config/api";
import { toast } from "../../components/Toast/Toast";
import "./Wishlist.css";

const Wishlist = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/wishlist/${user.email}`);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Database connection error. Please check if MongoDB is running.");
        }
        throw new Error("Failed to fetch wishlist");
      }

      const ids = await response.json();
      const idList = Array.isArray(ids) ? ids : [];

      if (idList.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productResponses = await Promise.all(
        idList.map((id) =>
          fetch(`${API_BASE_URL}/products/${id}`).then((r) =>
            r.ok ? r.json() : null
          )
        )
      );

      const list = productResponses.filter(Boolean);
      setProducts(list);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.message || "Failed to load wishlist");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (user?.email) fetchWishlist();
    };
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [user?.email, fetchWishlist]);

  const removeFromWishlist = async (productId) => {
    if (!user?.email) return;

    try {
      setRemoving(productId);
      const response = await fetch(`${API_BASE_URL}/wishlist/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      setProducts((prev) => prev.filter((p) => String(p._id) !== String(productId)));
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast("Failed to remove from wishlist. Please try again.", "error");
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (product) => {
    if (!user?.email) {
      history.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          product,
          quantity: 1,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          window.dispatchEvent(new CustomEvent("cartUpdated"));
          toast("Added to cart!");
        }
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (!user?.email) {
    return (
      <Container className="wishlist-page py-5">
        <Alert variant="warning">
          Please <Link to="/login">login</Link> to view your favorites.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="wishlist-page py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="wishlist-page">
      <Container className="py-5">
        <h1 className="mb-4">My Favorites</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {products.length === 0 ? (
          <div className="empty-wishlist text-center py-5">
            <h3>Your favorites list is empty</h3>
            <p className="text-muted">
              Click the ♥ icon on products to add them here.
            </p>
            <Button variant="primary" onClick={() => history.push("/shop")}>
              Browse Shop
            </Button>
          </div>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <div className="wishlist-card">
                  <Link to={`/shop?product=${product._id}`} className="wishlist-card-image-link">
                    <img
                      src={product.img || product.image || "/placeholder.jpg"}
                      alt={product.title}
                      className="wishlist-card-image"
                    />
                  </Link>
                  <div className="wishlist-card-body">
                    <h5 className="wishlist-card-title">{product.title}</h5>
                    <p className="wishlist-card-price">৳{product.price?.toFixed(2)}</p>
                    <div className="wishlist-card-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromWishlist(product._id)}
                        disabled={removing === product._id}
                      >
                        {removing === product._id ? "Removing…" : "Remove"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Wishlist;
