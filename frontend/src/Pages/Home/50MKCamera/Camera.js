import React from "react";
import "./Camera.css";

const Camera = () => {
  return (
    <div className="row camera-main g-0">
      <div className="col-sm-12 col-md-12 col-lg-6 camera-img">
        <img src="https://i.ibb.co/QjFT7wn/camera.png" alt="" />
      </div>
      <div className="col-sm-12 col-md-12 col-lg-6 camera-txt">
        <h3>CAMERA</h3>
        <p>
          Rockin' and rollin' all week long. Movin' on up to the east side. We
          finally got a piece of the pie. Sunny Days sweepin' the clouds away.
          On my way to where the air is sweet. Can you tell me how to get how to
          get to Sesame Street. Happy Days are yours and mine.
        </p>
        <p>
          <span className="lens">
            <img
              src="https://i.ibb.co/F5w27tL/Element-Lens2.png"
              alt=""
              className="img-fluid"
            />
          </span>
          <span>
            <img
              src="https://i.ibb.co/LgzjYXk/4K-video.png"
              alt=""
              className="four"
            />
          </span>
        </p>
      </div>
    </div>
  );
};

export default Camera;
