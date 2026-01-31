import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Services.css";
import ProductCard from "../../../components/ProductCard/ProductCard";
import API_BASE_URL from "../../../config/api";

const Services = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const productsList = data.products || data;
        setProducts(productsList.slice(0, 8));
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const handleAddToWishlist = (product) => {
    console.log("Added to wishlist:", product);
  };

  return (
    <div className="services-section">
      <Container>
        <div className="section-header text-center">
          <h2>Our Products</h2>
          <p>Explore our wide range of drone products and accessories</p>
        </div>
        <Row>
          {products.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Services;
