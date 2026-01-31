import React from "react";
import "./Gallery.css";

const Gallery = () => {
  return (
    <div>
      <div className="container">
        <div className="gallery-txt my-5">
          <h1>FLYING DRONES</h1>
          <p className="text-muted">
            They really are a scream the Addams Family! Their house is a museum
            where people come to see 'em. They really are a addams family.
          </p>
        </div>
        <div className="row g-0 gallery-row">
          <div className="col-sm-12 col-md-6 col-lg-6 gallery-col">
            <img
              src="https://i.ibb.co/Y0mBG7H/shutterstock-309081578.jpg"
              alt="Drone launch"
              className="img-fluid gallery-img"
            />
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 gallery-col">
            <img
              src="https://i.ibb.co/0BJ5Gjv/shutterstock-360798107.jpg"
              alt="Drone flying"
              className="img-fluid gallery-img"
            />
          </div>
        </div>
        <div className="row g-0 mb-5 gallery-row">
          <div className="col-sm-12 col-md-6 col-lg-4 gallery-col">
            <img
              src="https://i.ibb.co/grKQx2b/shutterstock-376470163.jpg"
              alt="Drone over coastal landscape"
              className="img-fluid gallery-img"
            />
          </div>
          <div className="col-sm-12 col-md-6 col-lg-8 gallery-col">
            <img
              src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop"
              alt="Drone aerial view"
              className="img-fluid gallery-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
