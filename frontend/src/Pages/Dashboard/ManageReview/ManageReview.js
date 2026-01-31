import React, { useState, useEffect, useCallback } from "react";
import { Container, Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import API_BASE_URL from "../../../config/api";
import "./ManageReview.css";

const ManageReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/ratings`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(data.error || "Failed to delete review");
      }
    } catch (err) {
      alert("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Container className="manage-review py-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading reviews...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="manage-review py-4">
      <h2 className="mb-4">Manage Reviews</h2>
      <p className="text-muted mb-4">
        Keep reviews visible on the site or delete inappropriate ones.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      {!reviews.length ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr key={review._id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={review.img || "https://i.ibb.co/7QZqBz7/user.png"}
                    alt=""
                    className="manage-review-thumb"
                  />
                </td>
                <td>{review.name || "—"}</td>
                <td className="manage-review-text">
                  {(review.text || "—").slice(0, 80)}
                  {(review.text || "").length > 80 ? "…" : ""}
                </td>
                <td>
                  <Badge bg="warning" text="dark">
                    {review.rating ?? "—"} / 5
                  </Badge>
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <Badge bg="success">Kept</Badge>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                  >
                    {deletingId === review._id ? "Deleting…" : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManageReview;
