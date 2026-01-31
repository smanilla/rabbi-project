import React from "react";
import { Carousel } from "react-bootstrap";
import "./Banner.css";

const Banner = () => {
  return (
    <div>
      <Carousel>
        <Carousel.Item className="slider-1 slider">
          <div className="slider-title">
            <h1>
              Success is where prepration
              <br />
              and oppurtunity meet
            </h1>
            <p>
              Its time to dress up right. It's time to raise the curtain on the
              muppet show to the night
            </p>
            <p>
              <span>
                <button className="btn learn-btn">LEARN MORE</button>
              </span>
              <span>
                <button className="btn contact-btn">CONTACT US</button>
              </span>
            </p>
          </div>
        </Carousel.Item>
        <Carousel.Item className="slider-2 slider">
          <div className="slider-title">
            <h1>
              Your hard work and effort will
              <br />
              make you famous one day
            </h1>
            <p>
              Get you favorite drone today and explore your own word. Waiting
              for you champ.
            </p>
            <p>
              <span>
                <button className="btn learn-btn">LEARN MORE</button>
              </span>
              <span>
                <button className="btn contact-btn">CONTACT US</button>
              </span>
            </p>
          </div>
        </Carousel.Item>
        <Carousel.Item className="slider-3 slider">
          <div className="slider-title">
            <h1>
              Get ready with you equipment
              <br />
              and explore world
            </h1>
            <p>
              The word is waiting for more talented people like you.Grab your
              passion today and move on.
            </p>
            <p>
              <span>
                <button className="btn learn-btn">LEARN MORE</button>
              </span>
              <span>
                <button className="btn contact-btn">CONTACT US</button>
              </span>
            </p>
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default Banner;
