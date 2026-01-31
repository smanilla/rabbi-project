import React, { useState } from "react";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import bg from "../../../images/login.svg";
import useAuth from "./../../../hooks/useAuth";
const Register = () => {
  const { regiError, registerNewUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRegistration = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password Must be at least 6 characters long.");
      return;
    }
    // if (!/(?=.*[A-Z].*[A-Z])/.test(password)) {
    //   setError("Password Must contain 2 upper case");
    //   return;
    // }
    registerNewUser(email, password, name)
      .then(() => {
        // Registration successful, user is auto-logged in
        window.location.href = "/";
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <>
      <Container className="py-5">
        <Row>
          <Col xs={12} md={6} className="mb-5">
            <img className="logo img-fluid" src={bg} alt="" />
          </Col>
          <Col xs={12} md={6}>
            <Form
              className="mx-auto pt-3 pb-4 w-75"
              onSubmit={handleRegistration}
            >
              <h2 className="text-center">REGISTER</h2>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>NAME</Form.Label>
                <Form.Control
                  type="text"
                  onBlur={handleNameChange}
                  placeholder="Your Full Name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  onBlur={handleEmailChange}
                  placeholder="Email Address"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>PASSWORD</Form.Label>
                <Form.Control
                  type="password"
                  onBlur={handlePasswordChange}
                  placeholder="..........."
                  required
                />
              </Form.Group>
              {(error || regiError) && (
                <div className="alert alert-danger" role="alert">
                  {error || regiError}
                </div>
              )}

              <div className="d-grid gap-2 my-4">
                <Button variant="secondary" type="submit">
                  Create Account
                </Button>
              </div>
              <div className="">
                <span>already have an account?</span>
                <Link to="/login">Login</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Register;
