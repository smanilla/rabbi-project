import React, { useState } from "react";
import "./Dashboard.css";
import { useEffect } from "react";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";
import MyOrder from "../MyOrder/MyOrder";
import AddService from "../AddService/AddService";
import ManageOrder from "../ManageOrder/ManageOrder";
import ManageProducts from "../ManageProducts/ManageProducts";
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import AddReview from "./../AddReview/AddReview";
import MakeAdmin from "../MakeAdmin/MakeAdmin";
import useAuth from "./../../../hooks/useAuth";
import Pay from "../Pay/Pay";
import API_BASE_URL from "../../../config/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      // First check if role is already in user object (from login)
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
          
          console.log("Admin check response:", data); // Debug log
          console.log("User object:", user); // Debug log
          
          // Check multiple possible response formats
          if (
            data.isAdmin === true || 
            data.user?.role === "admin" || 
            data[0]?.role === "admin" ||
            (Array.isArray(data) && data.length > 0 && data[0].role === "admin")
          ) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.role]);
  
  let { path, url } = useRouteMatch();
  
  if (loading) {
    return (
      <div className="dashboard-container my-5">
        <div className="text-center py-5">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container my-5">
      <div className="row">
        <div className="col-md-3">
          <h5 className="text-center fw-bold fs-1 mb-4">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </h5>
          <div className="dashboard-menu-container">
            {/* Debug info */}
            <div className="p-2 mb-2 bg-light rounded small" style={{fontSize: '12px', border: '1px solid #ddd'}}>
              <strong>Debug Info:</strong><br/>
              Email: {user?.email || 'N/A'}<br/>
              Role: {user?.role || 'N/A'}<br/>
              Admin Status: {isAdmin ? '✅ Yes' : '❌ No'}<br/>
              {!isAdmin && user?.email === 'admin@drone.com' && (
                <div className="mt-2 p-2 bg-warning text-dark rounded">
                  ⚠️ You're logged in as admin but role not detected.<br/>
                  Please <strong>logout and login again</strong> to refresh your session.
                </div>
              )}
            </div>
            
            {!isAdmin && (
              <>
                <Link to={`${url}/myOrder`} className="dashboard-menu-item">
                  <i className="fas fa-cart-arrow-down"></i> My Orders
                </Link>
                <Link to={`${url}/addReview`} className="dashboard-menu-item">
                  <i className="fas fa-star"></i> Add Review
                </Link>
                <Link to={`${url}/pay`} className="dashboard-menu-item">
                  <i className="fas fa-money-check-alt"></i> Pay
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to={`${url}`} className="dashboard-menu-item">
                  <i className="fas fa-chart-line"></i> Overview
                </Link>
                <Link to={`${url}/manageProducts`} className="dashboard-menu-item">
                  <i className="fas fa-box"></i> Manage Products
                </Link>
                <Link to={`${url}/addService`} className="dashboard-menu-item">
                  <i className="fas fa-plus-circle"></i> Add Product
                </Link>
                <Link to={`${url}/manageOrder`} className="dashboard-menu-item">
                  <i className="fas fa-tasks"></i> Manage Orders
                </Link>
                <Link to={`${url}/makeAdmin`} className="dashboard-menu-item">
                  <i className="fas fa-user-shield"></i> Make Admin
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="col-md-9">
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
            <Route exact path={`${path}/manageOrder`}>
              <ManageOrder></ManageOrder>
            </Route>
            <Route exact path={`${path}/manageProducts`}>
              <ManageProducts></ManageProducts>
            </Route>
            <Route exact path={`${path}/addService`}>
              <AddService></AddService>
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
