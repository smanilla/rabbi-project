import React, { useEffect, useState } from "react";
import Rating from "react-rating";
import "./Review.css";
import API_BASE_URL from "../../../config/api";

const Review = () => {
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/ratings`)
      .then((res) => res.json())
      .then((data) => setRatings(data))
      .catch((error) => console.error("Error fetching ratings:", error));
  }, []);
  return (
    <div className="review-main">
      <div className="review-title text-center">
        <h6>What's Our customers Say</h6>
        <h1 className="mb-4">CUSTOMER'S FEEDBACK</h1>
      </div>
      <div className="review row container mx-auto g-0">
        {ratings.map((rating) => (
          <div className="col-sm-12 col-md-6 col-lg-4 row mb-2 d-flex justify-content-center review-card gx-2">
            <div className="col-4">
              <img src={rating.img} alt="" />
            </div>
            <div className="col-8">
              <h4>{rating.name}</h4>
              <Rating
                emptySymbol="fa fa-star-o  rating-star"
                fullSymbol="fa fa-star rating-star"
                initialRating={rating.rating}
                readonly
              />
              <p>{rating.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review;
