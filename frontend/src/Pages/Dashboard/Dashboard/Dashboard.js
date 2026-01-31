import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { Switch, Route, NavLink, useRouteMatch } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import MyOrder from "../MyOrder/MyOrder";
import AddService from "../AddService/AddService";
import ManageOrder from "../ManageOrder/ManageOrder";
import ManageProducts from "../ManageProducts/ManageProducts";
import ManageReview from "../ManageReview/ManageReview";
import ManageUser from "../ManageUser/ManageUser";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import AddReview from "./../AddReview/AddReview";
import MakeAdmin from "../MakeAdmin/MakeAdmin";
import useAuth from "./../../../hooks/useAuth";
import Pay from "../Pay/Pay";
import API_BASE_URL from "../../../config/api";

const Dashboard = () => {
  const { user, logOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.role === "admin") {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      if (user?.email) {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/checkAdmin/${user.email}`);
          const data = await response.json();
          const admin =
            data.isAdmin === true ||
            data.user?.role === "admin" ||
            (Array.isArray(data) && data.length > 0 && data[0].role === "admin");
          setIsAdmin(!!admin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, [user?.email, user?.role]);

  const { path, url } = useRouteMatch();

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-loading">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-3 mb-0 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <button
        type="button"
        className="dashboard-sidebar-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"}`} />
      </button>
      <aside className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""}`}>
        <div className="dashboard-sidebar-inner">
          <div className="dashboard-user-card">
            <div className="dashboard-user-avatar">
              <i className="fas fa-user" />
            </div>
            <h3 className="dashboard-user-name">{user?.displayName || user?.name || "User"}</h3>
            <p className="dashboard-user-email">{user?.email || ""}</p>
            <span className={`dashboard-user-badge ${isAdmin ? "dashboard-user-badge-admin" : ""}`}>
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>
          <nav className="dashboard-nav">
            <span className="dashboard-nav-title">Menu</span>
            {!isAdmin && (
              <>
                <NavLink to={`${url}/myOrder`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-cart-arrow-down" /><span>My Orders</span>
                </NavLink>
                <NavLink to={`${url}/addReview`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-star" /><span>Add Review</span>
                </NavLink>
                <NavLink to={`${url}/pay`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-money-check-alt" /><span>Pay</span>
                </NavLink>
              </>
            )}
            {isAdmin && (
              <>
                <NavLink exact to={url} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-chart-line" /><span>Overview</span>
                </NavLink>
                <NavLink to={`${url}/manageProducts`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-box" /><span>Manage Products</span>
                </NavLink>
                <NavLink to={`${url}/addService`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-plus-circle" /><span>Add Product</span>
                </NavLink>
                <NavLink to={`${url}/manageOrder`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-tasks" /><span>Manage Orders</span>
                </NavLink>
                <NavLink to={`${url}/manageReview`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-star-half-alt" /><span>Manage Reviews</span>
                </NavLink>
                <NavLink to={`${url}/manageUser`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-users" /><span>Manage Users</span>
                </NavLink>
                <NavLink to={`${url}/makeAdmin`} className="dashboard-nav-item" activeClassName="dashboard-nav-item-active">
                  <i className="fas fa-user-shield" /><span>Make Admin</span>
                </NavLink>
              </>
            )}
            <div className="dashboard-nav-logout">
              <button type="button" onClick={logOut} className="dashboard-nav-item dashboard-nav-item-logout">
                <i className="fas fa-sign-out-alt" /><span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
      <div className="dashboard-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <main className="dashboard-main">
        <div className="dashboard-main-inner">
          <Switch>
            <Route exact path={`${path}`}>
              {isAdmin ? <AdminDashboard /> : <MyOrder />}
            </Route>
            <Route exact path={`${path}/myOrder`}>
              <MyOrder></MyOrder>
            </Route>
            <Route exact path={`${path}/addReview`}>
              <AddReview></AddReview>
            </Route>
            <Route exact path={`${path}/pay`}>
              <Pay></Pay>
            </Route>
            <Route exact path={`${path}/makeAdmin`}>
              <MakeAdmin></MakeAdmin>
            </Route>
            <Route exact path={`${path}/manageUser`}>
              <ManageUser></ManageUser>
            </Route>
            <Route exact path={`${path}/manageOrder`}>
              <ManageOrder></ManageOrder>
            </Route>
            <Route exact path={`${path}/manageReview`}>
              <ManageReview></ManageReview>
            </Route>
            <Route exact path={`${path}/manageProducts`}>
              <ManageProducts></ManageProducts>
            </Route>
            <Route exact path={`${path}/addService`}>
              <AddService></AddService>
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
