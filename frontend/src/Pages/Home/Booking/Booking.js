import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import "./Booking.css";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import API_BASE_URL from "../../../config/api";

const Detail = () => {
  const [pakage, setPakage] = useState([]);
  const { bookingId } = useParams();
  console.log(bookingId);
  useEffect(() => {
    fetch(`${API_BASE_URL}/products/${bookingId}`)
      .then((res) => res.json())
      .then((data) => setPakage(data))
      .catch((error) => console.error("Error fetching product:", error));
  }, [bookingId]);

  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    axios
      .post(`${API_BASE_URL}/orders`, data)
      .then((res) => {
        if (res.data.insertedId) {
          alert("Package booked successfully");
          reset();
        }
      });
  };
  const { user } = useAuth();

  return (
    <div className="detail-full mb-5 mt-2">
      <div className="detail-main row container mx-auto g-3">
        <div className="detail-area col-sm-12 col-md-12 col-lg-6  p-lg-5 ">
          <div className="card mb-4">
            <div className="div">
              <img src={pakage.img} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{pakage.title}</h5>
                <h5>Price: ৳{typeof pakage.price === 'number' ? pakage.price.toLocaleString('en-BD') : pakage.price}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="from-area col-sm-12 col-md-12 col-lg-6  p-lg-5 ">
          <h1 className="form-title">Please fill the form to buy your drone</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("name", { required: true })}
              placeholder="Full name"
              value={user.displayName}
            />
            <input
              {...register("product", { required: true })}
              placeholder="Product"
              value={pakage?.title}
            />
            <input
              {...register("address", { required: true })}
              placeholder="Full address"
            />
            <input
              type="hidden"
              {...register("detailId")}
              value={bookingId}
              readOnly
              className="detail-id"
            />
            <input
              type="email"
              {...register("email")}
              placeholder="Your email"
              value={user.email}
            />
            <input
              type="number"
              {...register("phone", { required: true })}
              placeholder="Your phone"
            />
            <input type="submit" className="submit" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Detail;

// import React, { useState } from "react";
// import { useParams } from "react-router";
// import { useEffect } from "react";
// import useAuth from "./../../../hooks/useAuth";
// import { useForm } from "react-hook-form";

// const Booking = () => {
//   const { user } = useAuth();
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = (data) => {
//     console.log(data);
//     data.status = "Pending";
//     fetch("https://young-gorge-80259.herokuapp.com/order", {
//       method: "POST",
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(data),
//     }).then((result) => {
//       if (result) {
//         alert("Added succesfully");
//         reset();
//       }
//     });
//   };

//   const { bookingId } = useParams();
//   const [book, setBook] = useState({});
//   useEffect(() => {
//     fetch(`https://young-gorge-80259.herokuapp.com/services/${bookingId}`)
//       .then((res) => res.json())
//       .then((data) => setBook(data));
//   }, []);
//   return (
//     <div className="container my-5 bg-light">
//       <div className="row justify-content-between">
//         <div
//           className="col-md-6 border shadow border-primary rounded
// "
//         >
//           <div class="card">
//             <img src={book.img} class="card-img-top" alt="..." />
//             <div class="card-body">
//               <p class="card-text fs-5 fw-bold fst-italic text-muted  text-start">
//                 {book.description} we are now offering your car at discount
//                 price and you have o be habby that you are now our familly
//                 member and your car are most probably{" "}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <h3 className="my-2 fs-3 fw-bold  text-center">
//             Please place your order
//           </h3>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className=" submit border text-center p-3 bg-light shadow-lg"
//           >
//             <input defaultValue={user.displayName} {...register("name")} />
//             <br />
//             <br />
//             <input defaultValue={user.email} {...register("email")} />

//             {errors.email && <span>This field is required</span>}
//             <br />
//             <br />
//             <input {...register("address")} placeholder="Address" />
//             <br />
//             <br />
//             <input {...register("price")} placeholder="Price" />
//             <br />
//             <br />
//             <input {...register("place")} placeholder="Travel place" />
//             <br />
//             <br />

//             <input type="number" {...register("phone")} placeholder="phone" />
//             <br />
//             <br />

//             <input
//               className="bg-primary text-white p-3 rounded "
//               type="submit"
//             />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Booking;
