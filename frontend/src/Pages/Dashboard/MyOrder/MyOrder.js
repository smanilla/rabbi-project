import React, { useState, useEffect } from "react";
import useAuth from "./../../../hooks/useAuth";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../../config/api";

const MyOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      setError("");
      fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch orders");
          return res.json();
        })
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error fetching orders:", err);
          setError(err.message || "Failed to load orders");
          setOrders([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, [user?.email]);

  const handleDeleteOrder = (id) => {
    const proceed = window.confirm("Are you sure you want to delete this order?");
    if (!proceed) return;
    fetch(`${API_BASE_URL}/orders/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.deletedCount) {
          setOrders((prev) => prev.filter((order) => order._id !== id));
        } else {
          alert(data.error || "Failed to delete order");
        }
      })
      .catch(() => alert("Failed to delete order"));
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-primary text-center mb-4">My Orders ({orders?.length || 0})</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {!orders?.length ? (
        <p className="text-center text-muted py-4">You have no orders yet. <Link to="/shop">Browse shop</Link> to place an order.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Tracking</th>
              <th>Date</th>
              <th>Items</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>
                  <code>{order.trackingNumber || "—"}</code>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  {order.items?.length
                    ? order.items.map((item, i) => (
                        <span key={i}>
                          {item.title || "Item"} × {item.quantity || 1}
                          {i < order.items.length - 1 ? "; " : ""}
                        </span>
                      ))
                    : "—"}
                </td>
                <td>{order.shippingAddress?.phone || "—"}</td>
                <td>
                  {order.shippingAddress?.address || "—"}
                  {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                </td>
                <td>৳{Number(order.total || 0).toLocaleString("en-BD")}</td>
                <td>{order.status || "Pending"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MyOrder;
