import React, { useEffect, useState } from "react";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const history = useHistory();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from location state
    if (location.state) {
      setOrderData(location.state);
    }
  }, [location.state]);

  return (
    <div className="order-success-page">
      <Container className="py-5">
        <div className="text-center">
          <div className="success-icon-wrapper">
            <i className="fas fa-check-circle success-icon"></i>
          </div>
          <h1 className="mt-4 mb-3">Order Placed Successfully!</h1>
          <p className="lead text-muted mb-4">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>

          {orderData && (
            <Card className="order-details-card">
              <Card.Body>
                <h5 className="mb-4">Order Details</h5>
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">Order ID:</span>
                    <span className="value">{orderData.orderId}</span>
                  </div>
                  {orderData.trackingNumber && (
                    <div className="info-row">
                      <span className="label">Tracking Number:</span>
                      <span className="value">{orderData.trackingNumber}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">৳{orderData.total?.toLocaleString('en-BD') || "0.00"}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          <Alert variant="info" className="mt-4">
            <strong>What's next?</strong>
            <ul className="text-start mt-2 mb-0">
              <li>You will receive an order confirmation email shortly</li>
              <li>We'll notify you when your order ships</li>
              <li>You can track your order using the tracking number</li>
            </ul>
          </Alert>

          <div className="action-buttons mt-4">
            <Button
              variant="primary"
              size="lg"
              className="me-3"
              onClick={() => history.push("/dashboard")}
            >
              View My Orders
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => history.push("/shop")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderSuccess;
