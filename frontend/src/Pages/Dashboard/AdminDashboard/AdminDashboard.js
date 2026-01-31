import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link, useRouteMatch } from "react-router-dom";
import API_BASE_URL from "../../../config/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { url } = useRouteMatch();
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
        fetch(`${API_BASE_URL}/products?limit=1`),
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/users`),
      ]);

      const productsData = productsRes.ok ? await productsRes.json() : {};
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];

      const totalProducts = productsData.pagination?.total ?? (Array.isArray(productsData.products) ? productsData.products.length : 0);
      const ordersList = Array.isArray(ordersData) ? ordersData : [];

      const totalRevenue = ordersList.reduce((sum, order) => {
        const orderTotal = order.total != null
          ? Number(order.total)
          : (order.items || []).reduce(
              (itemSum, item) => itemSum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
              0
            );
        return sum + orderTotal;
      }, 0);

      const pendingOrders = ordersList.filter(
        (order) => (order.status || "").toLowerCase() === "pending"
      ).length;
      const completedOrders = ordersList.filter(
        (order) => ["completed", "delivered"].includes((order.status || "").toLowerCase())
      ).length;

      setStats({
        totalProducts,
        totalOrders: ordersList.length,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
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
                    <Link to={`${url}/addService`} className="quick-action-item">
                      <div className="action-icon">➕</div>
                      <p>Add Product</p>
                    </Link>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Link to={`${url}/manageOrder`} className="quick-action-item">
                      <div className="action-icon">📋</div>
                      <p>Manage Orders</p>
                    </Link>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Link to={`${url}/manageProducts`} className="quick-action-item">
                      <div className="action-icon">🏷️</div>
                      <p>Manage Products</p>
                    </Link>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Link to={`${url}/manageUser`} className="quick-action-item">
                      <div className="action-icon">👤</div>
                      <p>Users</p>
                    </Link>
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
