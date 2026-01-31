import React from "react";
import { useForm } from "react-hook-form";
import API_BASE_URL from "../../../config/api";

const MakeAdmin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    fetch(`${API_BASE_URL}/makeAdmin`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => console.log(result));
  };
  return (
    <div className="add-service">
      <h2 className="text-center">Make Admin</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} placeholder="email" />

        {errors.email && <span>This field is required</span>}

        {/* <input {...register("img")} placeholder="Image" />
      <input type="number" {...register("price")}placeholder="Price" /> */}
        <input type="submit" value="make admin" />
      </form>
    </div>
  );
};

export default MakeAdmin;
