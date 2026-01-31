import React from "react";
import { useForm } from "react-hook-form";
import ratingImg from "../../../images/rating.svg";
import "./AddReview.css";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import API_BASE_URL from "../../../config/api";

const AddReview = () => {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    axios
      .post(`${API_BASE_URL}/ratings`, data)
      .then((res) => {
        if (res.data.insertedId) {
          alert("Review added successfully");
          reset();
        }
      });
  };
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-center my-5">PLEASE ADD YOUR REVIEW HERE</h1>
      <div className="row container mx-auto my-5">
        <div className="col-sm-12 col-md-12 col-lg-6 ">
          <img src={ratingImg} alt="" className="img-fluid" />
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6 from-area">
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("name", { required: true })}
              placeholder="Full name"
              value={user?.displayName || user?.name || ""}
            />
            <input
              type="hidden"
              {...register("img")}
              placeholder="Image"
              value={user?.photoURL || ""}
            />
            <br />
            <textarea
              {...register("text", { required: true })}
              placeholder="Your Feedback"
            />
            <br />
            <input
              type="number"
              {...register("rating", { required: true, min: 1, max: 5 })}
              placeholder="Rating 1-5"
            />
            <br />
            <input type="submit" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReview;
