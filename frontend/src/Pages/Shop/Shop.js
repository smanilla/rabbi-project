import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import ProductCard from "../../components/ProductCard/ProductCard";
import API_BASE_URL from "../../config/api";
import "./Shop.css";

const Shop = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const data = await response.json();
      setFilteredProducts(data.products || data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, selectedCategory, searchTerm, priceRange.min, priceRange.max]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch categories:", response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handlePriceFilter = () => {
    // fetchProducts will be called automatically via useEffect
  };

  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
  };

  const handleAddToWishlist = (product) => {
    console.log("Added to wishlist:", product);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <Container>
          <h1>Shop Our Products</h1>
          <p>Discover our amazing collection of drone products</p>
        </Container>
      </div>

      <Container className="shop-content">
        <Row>
          {/* Sidebar Filters */}
          <Col lg={3} md={4} className="shop-sidebar">
            <div className="filter-section">
              <h3>Filters</h3>

              {/* Search */}
              <div className="filter-group">
                <h4>Search</h4>
                <Form onSubmit={handleSearch}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100 mt-2">
                    Search
                  </Button>
                </Form>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <h4>Categories</h4>
                <div className="category-list">
                  <button
                    className={`category-item ${!selectedCategory ? "active" : ""}`}
                    onClick={() => handleCategoryChange("")}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.name || cat}
                      className={`category-item ${
                        selectedCategory === (cat.name || cat) ? "active" : ""
                      }`}
                      onClick={() => handleCategoryChange(cat.name || cat)}
                    >
                      {cat.name || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button
                  variant="outline-primary"
                  className="w-100 mt-2"
                  onClick={handlePriceFilter}
                >
                  Apply
                </Button>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <h4>Sort By</h4>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="title">Name</option>
                  <option value="averageRating">Rating</option>
                </Form.Select>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mt-2"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </Form.Select>
              </div>
            </div>
          </Col>

          {/* Products Grid - fixed height container to prevent layout jump */}
          <Col lg={9} md={8} className="shop-products-col">
            <div className="shop-products-inner">
              {loading ? (
                <div className="loading-container">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <div className="products-header">
                    <p>
                      Showing {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Row>
                    {filteredProducts.map((product) => (
                      <Col key={product._id} xs={12} sm={6} lg={4}>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onAddToWishlist={handleAddToWishlist}
                        />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Shop;
