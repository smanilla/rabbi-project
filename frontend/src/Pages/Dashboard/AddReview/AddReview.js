import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Alert } from "react-bootstrap";
import ratingImg from "../../../images/rating.svg";
import "./AddReview.css";
import useAuth from "../../../hooks/useAuth";
import API_BASE_URL from "../../../config/api";

const AddReview = () => {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (user) {
      setValue("name", user?.displayName || user?.name || "");
      setValue("img", user?.photoURL || "");
    }
  }, [user, setValue]);

  const onSubmit = (data) => {
    setError("");
    setSuccess(false);
    setSubmitting(true);
    fetch(`${API_BASE_URL}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name || user?.displayName || user?.name || "Customer",
        text: data.text,
        rating: Number(data.rating) || 5,
        img: data.img || user?.photoURL || "https://i.ibb.co/7QZqBz7/user.png",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.ratingId) {
          setSuccess(true);
          reset({ name: user?.displayName || user?.name || "", text: "", rating: 5, img: user?.photoURL || "" });
        } else {
          setError(data.error || "Failed to add review");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to add review. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <h1 className="text-center my-5">PLEASE ADD YOUR REVIEW HERE</h1>
      <div className="row container mx-auto my-5">
        <div className="col-sm-12 col-md-12 col-lg-6 ">
          <img src={ratingImg} alt="" className="img-fluid" />
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6 from-area">
          {success && <Alert variant="success">Review added successfully. Thank you!</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Control
                {...register("name", { required: true })}
                placeholder="Full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                {...register("text", { required: true })}
                placeholder="Your feedback"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                min={1}
                max={5}
                step={1}
                {...register("rating", { required: true, min: 1, max: 5 })}
                placeholder="Rating 1-5"
              />
            </Form.Group>
            <input type="hidden" {...register("img")} />
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddReview;
