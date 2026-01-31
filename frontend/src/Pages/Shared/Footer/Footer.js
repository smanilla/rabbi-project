import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <div>
      <footer className="site-footer">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <h4 className="mb-3">Drone Shop</h4>
              <p className="text-justify mt-4">
                Welcome to Drone. We provide best quality drone in town. For any
                kind of modern new drone visit our shop. Here we have
                professional guide and quick eqipment for you.
              </p>
            </div>

            <div className="col-xs-6 col-md-3">
              <h6>Contact Us</h6>
              <ul className="footer-links">
                <li>+01852-1265122</li>
                <li>+01852-1265122</li>
                <li>support@example.com</li>
                <li>2752 Willison Street</li>
                <li>Eagan, United State</li>
              </ul>
            </div>

            <div className="col-xs-6 col-md-3">
              <h6>SUPPORT</h6>
              <ul className="footer-links">
                <li>
                  <Link to="/home">Home</Link>
                </li>
                <li>
                  <Link to="/about">About US</Link>
                </li>
                <li>Contact Us</li>
                <li>Contibute</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <hr />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-8 col-sm-6 col-xs-12">
              <p className="copyright-text">
                Copyright &copy; 2021 All Rights Reserved by Jiban Ahammed
              </p>
            </div>

            <div className="col-md-4 col-sm-6 col-xs-12">
              <ul className="social-icons">
                <li>
                  <a href="https://facebook.com" className="facebook" target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-facebook"></i>
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" className="twitter" target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-twitter"></i>
                  </a>
                </li>
                <li>
                  <a href="https://dribbble.com" className="dribbble" target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-dribbble"></i>
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" className="linkedin" target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-linkedin"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
