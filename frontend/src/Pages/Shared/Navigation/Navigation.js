import React, { useState, useEffect, useCallback } from "react";
import "./Navigation.css";
import { Container, Nav, Navbar, Badge } from "react-bootstrap";
import useAuth from "./../../../hooks/useAuth";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../../config/api";

const Navigation = () => {
  const { user, logOut } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${user.email}`);
      if (response.ok) {
        const cart = await response.json();
        const count = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartCount(0);
    }
  }, [user?.email]);

  const fetchWishlistCount = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${user.email}`);
      if (response.ok) {
        const wishlist = await response.json();
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistCount(0);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchCartCount();
      fetchWishlistCount();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user?.email, fetchCartCount, fetchWishlistCount]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?.email) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user?.email, fetchCartCount]);

  return (
    <Navbar collapseOnSelect expand="lg" bg="white" variant="light" className="modern-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="navbar-brand">
          <img src="https://i.ibb.co/5TL68Fq/logo-black.png" alt="Drone" className="logo-img" />
          <span className="brand-text">Drone</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home" className="nav-link">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/shop" className="nav-link">
              Shop
            </Nav.Link>
            <Nav.Link as={Link} to="/explore" className="nav-link">
              Explore
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link">
              About Us
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center">
            {user?.email ? (
              <>
                <Nav.Link as={Link} to="/wishlist" className="nav-icon-link">
                  <span className="nav-icon">♥</span>
                  {wishlistCount > 0 && (
                    <Badge bg="danger" className="icon-badge">
                      {wishlistCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" className="nav-icon-link">
                  <span className="nav-icon">🛒</span>
                  {cartCount > 0 && (
                    <Badge bg="primary" className="icon-badge">
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link
                  className="btn-nav p-2 me-2"
                  as={Link}
                  to="/dashboard"
                >
                  Dashboard
                </Nav.Link>
                <button onClick={logOut} className="btn-nav me-2">
                  Logout
                </button>
                <Navbar.Text className="user-name">
                  {user?.displayName || user?.name}
                </Navbar.Text>
              </>
            ) : (
              <>
                <Nav.Link className="btn-nav p-2" as={Link} to="/login#login">
                  Login
                </Nav.Link>
                <Nav.Link className="btn-nav-register p-2" as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
