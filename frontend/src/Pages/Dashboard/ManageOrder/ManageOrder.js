import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";
import API_BASE_URL from "../../../config/api";
import "./ManageOrder.css";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("Error fetching orders", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || "Pending");
    setShowStatusModal(true);
  };

  const updateOrderStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${selectedOrder._id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert("Order status updated successfully", "success");
        setShowStatusModal(false);
        fetchOrders();
      } else {
        showAlert(data.error || "Error updating order status", "danger");
      }
    } catch (error) {
      showAlert("Error updating order status", "danger");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok || data.success) {
        showAlert("Order deleted successfully", "success");
        fetchOrders();
      } else {
        showAlert("Error deleting order", "danger");
      }
    } catch (error) {
      showAlert("Error deleting order", "danger");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: "warning",
      Processing: "info",
      Shipped: "primary",
      Delivered: "success",
      Completed: "success",
      Cancelled: "danger",
    };
    return statusColors[status] || "secondary";
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const calculateTotal = (order) => {
    if (order.total) return order.total;
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );
    }
    return 0;
  };

  return (
    <div className="manage-orders">
      <Container>
        <div className="page-header">
          <h2>Manage Orders ({orders.length})</h2>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
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

        {loading ? (
          <div className="text-center py-5">Loading orders...</div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr key={order._id}>
                      <td>#{order.trackingNumber || order._id.slice(-6)}</td>
                      <td>{order.name || order.customerName || "N/A"}</td>
                      <td>{order.email}</td>
                      <td>
                        {order.items
                          ? `${order.items.length} item(s)`
                          : order.product || "N/A"}
                      </td>
                      <td>৳{calculateTotal(order).toLocaleString('en-BD')}</td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status || "Pending"}
                        </Badge>
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleStatusUpdate(order)}
                        >
                          Update Status
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteOrder(order._id)}
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

        {/* Status Update Modal */}
        <Modal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p>
                  <strong>Order ID:</strong> #
                  {selectedOrder.trackingNumber || selectedOrder._id.slice(-6)}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedOrder.email}
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={updateOrderStatus}>
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ManageOrder;
