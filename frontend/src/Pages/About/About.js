import React from "react";
import Gallery from "../Home/Gallery/Gallery";

import "./About.css";

const About = () => {
  return (
    <div>
      <div className="about-main row container mx-auto">
        <div className=" col-sm-12 col-md-6 p-lg-5 about-img">
          <img
            src="https://i.ibb.co/W2zB5DL/drone.png"
            alt=""
            className="img-fluid"
          />
        </div>
        <div className="col-sm-12 col-md-6  p-lg-5 about-items">
          <h6>About Drone</h6>
          <h1>The Best Drone Company.</h1>
          <p>
            Fusce aliquam luctus est, eget tincidunt velit scelerisque rhoncus.
            Aliquam lacinia ipsum ornare, porttitor risus nec, mattis mauris.
            Nunc nec ornare nisi, vel elementum est. Proin malesuada venenatis
            ex, eu fringilla justo scelerisque sit amet. Sed fringilla nec purus
            non venenatis. Aliquam nec turpis pharetra, bibendum lorem in,
            sollicitudin nibh. Nulla sit amet lacus diam.
          </p>
        </div>
      </div>
      <Gallery></Gallery>
    </div>
  );
};

export default About;
