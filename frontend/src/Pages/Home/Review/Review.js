import React, { useEffect, useState } from "react";
import Rating from "react-rating";
import "./Review.css";
import API_BASE_URL from "../../../config/api";

const Review = () => {
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        // API may return array or { ratings: [...] }
        const list = Array.isArray(data) ? data : (data?.ratings ?? []);
        setRatings(Array.isArray(list) ? list : []);
      })
      .catch((error) => console.error("Error fetching ratings:", error));
  }, []);
  const ratingList = Array.isArray(ratings) ? ratings : [];
  return (
    <div className="review-main">
      <div className="review-title text-center">
        <h6>What's Our customers Say</h6>
        <h1 className="mb-4">CUSTOMER'S FEEDBACK</h1>
      </div>
      <div className="review-grid container mx-auto">
        {ratingList.map((rating) => (
          <div key={rating._id || rating.name + rating.text} className="review-card">
            <div className="review-card-avatar">
              {rating.img ? (
                <img src={rating.img} alt={rating.name || "Customer"} />
              ) : (
                <div className="review-card-avatar-placeholder" aria-hidden="true">
                  <i className="fa fa-user" />
                </div>
              )}
            </div>
            <div className="review-card-body">
              <h4 className="review-card-name">{rating.name || "Customer"}</h4>
              <Rating
                emptySymbol="fa fa-star-o rating-star"
                fullSymbol="fa fa-star rating-star"
                initialRating={rating.rating ?? 0}
                readonly
              />
              <p className="review-card-text">{rating.text || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review;
