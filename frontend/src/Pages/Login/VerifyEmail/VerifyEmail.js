import React, { useState, useEffect } from "react";
import { Container, Alert, Button, Spinner } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const VerifyEmail = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${API_URL}/verify-email/${token}`);
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified. You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Invalid or expired verification link. Please request a new one from the login page.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Verification failed. Please try again or request a new link.");
      }
    };

    verify();
  }, [token]);

  return (
    <Container className="py-5 text-center" style={{ maxWidth: "500px" }}>
      {status === "loading" && (
        <>
          <Spinner animation="border" role="status" />
          <p className="mt-3">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <Alert variant="success" className="mb-4">
            <Alert.Heading>Email verified</Alert.Heading>
            <p className="mb-0">{message}</p>
          </Alert>
          <Button as={Link} to="/login" variant="primary">
            Go to Login
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Verification failed</Alert.Heading>
            <p className="mb-0">{message}</p>
          </Alert>
          <Button as={Link} to="/login" variant="primary">
            Go to Login
          </Button>
          <p className="mt-3 small text-muted">
            You can request a new verification email from the login page.
          </p>
        </>
      )}
    </Container>
  );
};

export default VerifyEmail;
