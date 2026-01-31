import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API_BASE_URL from "../../config/api";
import "./Checkout.css";

const Checkout = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
    paymentMethod: "cash",
    notes: "",
  });

  const fetchCart = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/${user.email}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
      
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: user.displayName || user.name || "",
      }));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.displayName, user?.name]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50000 ? 0 : 500;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items to cart first.");
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const orderData = {
        email: user.email,
        items: cartItems,
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        payment: {
          method: formData.paymentMethod,
          status: formData.paymentMethod === "cash" ? "pending" : "pending",
        },
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        notes: formData.notes,
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to place order");
      }

      const result = await response.json();
      
      // Redirect to order success page with order ID
      history.push(`/order-success/${result.orderId}`, {
        orderId: result.orderId,
        trackingNumber: result.trackingNumber,
        total: calculateTotal(),
      });
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.email) {
    return (
      <Container className="checkout-page py-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to proceed with checkout.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="checkout-page py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="checkout-page py-5">
        <Alert variant="info">
          Your cart is empty. <a href="/shop">Continue shopping</a> to add items.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="checkout-page">
      <Container className="py-5">
        <h1 className="mb-4">Checkout</h1>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Shipping Information</h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your@email.com"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="01XXXXXXXXX"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Dhaka"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Address *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="House/Flat No., Road, Area"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="1234"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h4>Payment Method</h4>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Check
                      type="radio"
                      label="Cash on Delivery"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === "cash"}
                      onChange={handleInputChange}
                      id="payment-cash"
                    />
                    <Form.Check
                      type="radio"
                      label="bKash"
                      name="paymentMethod"
                      value="bkash"
                      checked={formData.paymentMethod === "bkash"}
                      onChange={handleInputChange}
                      id="payment-bkash"
                    />
                    <Form.Check
                      type="radio"
                      label="Nagad"
                      name="paymentMethod"
                      value="nagad"
                      checked={formData.paymentMethod === "nagad"}
                      onChange={handleInputChange}
                      id="payment-nagad"
                    />
                    <Form.Check
                      type="radio"
                      label="Bank Transfer"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === "bank"}
                      onChange={handleInputChange}
                      id="payment-bank"
                    />
                  </Form.Group>

                  {formData.paymentMethod !== "cash" && (
                    <Alert variant="info" className="mt-3">
                      Payment instructions will be sent to your email after order confirmation.
                    </Alert>
                  )}
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h4>Additional Notes (Optional)</h4>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or notes for your order..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="order-summary">
                <Card.Header>
                  <h4>Order Summary</h4>
                </Card.Header>
                <Card.Body>
                  <div className="order-items">
                    {cartItems.map((item, index) => (
                      <div key={`${item.productId}-${item.variation || index}`} className="order-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{item.title}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                          <div className="text-end">
                            <strong>৳{(item.price * item.quantity).toLocaleString('en-BD')}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>৳{calculateSubtotal().toLocaleString('en-BD')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        `৳${calculateShipping().toLocaleString('en-BD')}`
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>৳{calculateTotal().toLocaleString('en-BD')}</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mt-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="w-100 mt-2"
                    onClick={() => history.push("/cart")}
                    disabled={submitting}
                  >
                    Back to Cart
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default Checkout;
