import React from "react";
import { Link } from "react-router-dom";
import "./Intro.css";

const Intro = () => {
  return (
    <div>
      <h1 className="text-center mt-5 fw-bold intro-title">INTRODUCTION</h1>
      <div className="drone-img d-flex justify-content-center">
        <img
          src="https://i.ibb.co/0Dr6brH/singlebanner.jpg"
          alt=""
          className="img-fluid"
        />
      </div>
      <div className="intro-text container mx-auto text-center">
        <h3>CINEMATIC MADE AUTOMATIC</h3>
        <p>
          And you know where you were then. Girls were girls and men were men.
          Mister we could use a man like Herbert Hoover again. So get a witch's
          shawl on a broomstick you can crawl on. Were gonna pay a call on the
          Addams Family. Goodbye gray sky there's nothing can hold me when I
          hold you. Feels so right it cant be wrong
        </p>
        <button className="contact-us-btn" as={Link} to="/about">
          CONTACT US
        </button>
      </div>
    </div>
  );
};

export default Intro;
