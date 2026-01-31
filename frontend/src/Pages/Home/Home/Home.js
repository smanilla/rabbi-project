import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Banner from "./../Banner/Banner";
import Services from "./../Services/Services";
import Review from "./../Review/Review";
import Intro from "../Intro/Intro";
import Camera from "../50MKCamera/Camera";
import Gallery from "../Gallery/Gallery";
import ProductCard from "../../../components/ProductCard/ProductCard";
import API_BASE_URL from "../../../config/api";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/featured`);
        if (cancelled) return;
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data.slice(0, 8) : [];
          if (!cancelled) setFeaturedProducts(list);
        } else {
          // Fallback to latest products
          const fallbackResponse = await fetch(`${API_BASE_URL}/products?sortBy=createdAt&sortOrder=desc&limit=8`);
          if (cancelled) return;
          const fallbackData = await fallbackResponse.json();
          const list = fallbackData.products || (Array.isArray(fallbackData) ? fallbackData.slice(0, 8) : []);
          if (!cancelled) setFeaturedProducts(Array.isArray(list) ? list.slice(0, 8) : []);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching featured products:", error);
        try {
          const response = await fetch(`${API_BASE_URL}/products?sortBy=createdAt&sortOrder=desc&limit=8`);
          if (cancelled) return;
          const data = await response.json();
          const list = data.products || (Array.isArray(data) ? data.slice(0, 8) : []);
          if (!cancelled) setFeaturedProducts(Array.isArray(list) ? list.slice(0, 8) : []);
        } catch (err) {
          if (!cancelled) {
            console.error("Error fetching products:", err);
            setFeaturedProducts([]);
          }
        }
      }
    };
    fetchFeaturedProducts();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const handleAddToWishlist = (product) => {
    console.log("Added to wishlist:", product);
  };

  return (
    <div className="home-page">
      <Banner></Banner>
      
      <Intro></Intro>
      
      <Camera></Camera>
      
      <Services></Services>
      
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-products-section">
          <Container>
            <div className="section-header text-center">
              <h2>Featured Products</h2>
              <p>Discover our most popular drone products</p>
            </div>
            <Row>
              {featuredProducts.map((product) => (
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
        </section>
      )}
      
      <Gallery></Gallery>
      
      <Review></Review>
    </div>
  );
};

export default Home;
