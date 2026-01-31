import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import API_BASE_URL from "../../../config/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/addUserInfo`).catch(() => null),
      ]);

      const products = await productsRes.json();
      const orders = await ordersRes.json();
      const users = usersRes ? await usersRes.json() : [];

      const productsList = products.products || products;
      const ordersList = Array.isArray(orders) ? orders : [];

      const totalRevenue = ordersList.reduce((sum, order) => {
        const orderTotal = order.items?.reduce(
          (itemSum, item) => itemSum + (item.price || 0) * (item.quantity || 1),
          order.total || 0
        );
        return sum + (orderTotal || 0);
      }, 0);

      const pendingOrders = ordersList.filter(
        (order) => order.status === "Pending"
      ).length;
      const completedOrders = ordersList.filter(
        (order) => order.status === "Completed" || order.status === "Delivered"
      ).length;

      setStats({
        totalProducts: productsList.length,
        totalOrders: ordersList.length,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders,
        completedOrders,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Container>
          <div className="text-center py-5">Loading...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Container>
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>

        <Row className="stats-row">
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card stat-card-primary">
              <Card.Body>
                <div className="stat-icon">📦</div>
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card stat-card-success">
              <Card.Body>
                <div className="stat-icon">🛒</div>
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card stat-card-info">
              <Card.Body>
                <div className="stat-icon">👥</div>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card stat-card-warning">
              <Card.Body>
                <div className="stat-icon">💰</div>
                <h3>৳{parseFloat(stats.totalRevenue).toLocaleString('en-BD')}</h3>
                <p>Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="stats-row">
          <Col md={6} className="mb-4">
            <Card className="stat-card stat-card-danger">
              <Card.Body>
                <div className="stat-icon">⏳</div>
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="stat-card stat-card-success">
              <Card.Body>
                <div className="stat-icon">✅</div>
                <h3>{stats.completedOrders}</h3>
                <p>Completed Orders</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="quick-actions-card">
              <Card.Header>
                <h4>Quick Actions</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <div className="quick-action-item">
                      <div className="action-icon">➕</div>
                      <p>Add Product</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="quick-action-item">
                      <div className="action-icon">📋</div>
                      <p>Manage Orders</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="quick-action-item">
                      <div className="action-icon">🏷️</div>
                      <p>Categories</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="quick-action-item">
                      <div className="action-icon">👤</div>
                      <p>Users</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
