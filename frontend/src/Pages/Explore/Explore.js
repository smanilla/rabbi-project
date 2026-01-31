import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "../../components/ProductCard/ProductCard";
import API_BASE_URL from "../../config/api";
import "./Explore.css";

const Explore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data.products || data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const handleAddToWishlist = (product) => {
    console.log("Added to wishlist:", product);
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <Container>
          <h1>Explore Our Products</h1>
          <p>Discover the latest drone technology and accessories</p>
        </Container>
      </div>

      <Container className="explore-content">
        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
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
        )}
      </Container>
    </div>
  );
};

export default Explore;
