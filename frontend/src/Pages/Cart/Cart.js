import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API_BASE_URL from "../../config/api";
import "./Cart.css";

const Cart = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/cart/${user.email}`);
      
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Database connection error. Please check if MongoDB is running.");
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error.message || "Failed to load cart items");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCart]);

  const updateQuantity = async (productId, newQuantity, variation = null) => {
    if (!user?.email) return;

    if (newQuantity <= 0) {
      removeItem(productId, variation);
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          productId,
          quantity: newQuantity,
          variation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId, variation = null) => {
    if (!user?.email) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/cart/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          productId,
          variation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!user?.email) return;
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/cart/clear/${user.email}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setCartItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Failed to clear cart. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  if (!user?.email) {
    return (
      <Container className="cart-page py-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to view your cart.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="cart-page py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="cart-page">
      <Container className="py-5">
        <h1 className="mb-4">Shopping Cart</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart text-center py-5">
            <h3>Your cart is empty</h3>
            <p className="text-muted">Add some products to your cart to get started!</p>
            <Button variant="primary" onClick={() => history.push("/shop")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <Row>
              <Col lg={8}>
                <div className="cart-items">
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={`${item.productId}-${item.variation || index}`}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.img || "/placeholder.jpg"}
                                alt={item.title}
                                className="cart-item-image me-3"
                                onError={(e) => {
                                  e.target.src = "/placeholder.jpg";
                                }}
                              />
                              <div>
                                <h6 className="mb-0">{item.title}</h6>
                                {item.variation && (
                                  <small className="text-muted">Variation: {item.variation}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>৳{item.price?.toLocaleString('en-BD') || "0.00"}</td>
                          <td>
                            <div className="quantity-controls d-flex align-items-center">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variation)}
                                disabled={updating}
                              >
                                -
                              </Button>
                              <span className="mx-3">{item.quantity}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variation)}
                                disabled={updating}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td>৳{calculateItemTotal(item).toLocaleString('en-BD')}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeItem(item.productId, item.variation)}
                              disabled={updating}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <Button variant="outline-danger" onClick={clearCart} disabled={updating}>
                  Clear Cart
                </Button>
              </Col>
              <Col lg={4}>
                <div className="cart-summary">
                  <h4>Order Summary</h4>
                  <div className="summary-item">
                    <span>Subtotal:</span>
                    <span>৳{calculateTotal().toLocaleString('en-BD')}</span>
                  </div>
                  <div className="summary-item">
                    <span>Shipping:</span>
                    <span>৳{calculateTotal() > 50000 ? "0" : "500"}</span>
                  </div>
                  <hr />
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>৳{(calculateTotal() + (calculateTotal() > 50000 ? 0 : 500)).toLocaleString('en-BD')}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 mt-3"
                    onClick={() => history.push("/checkout")}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-100 mt-2"
                    onClick={() => history.push("/shop")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Cart;
