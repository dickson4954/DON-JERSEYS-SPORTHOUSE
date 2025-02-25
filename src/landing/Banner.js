import { useEffect } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min";
import BannerZero from "./images/banner-0.jpg";
import BannerOne from "./images/banner-1.jpg";
import BannerTwo from "./images/banner-2.jpg";

function BannerIndicator({ index, active }) {
  return (
    <button
      type="button"
      data-bs-target="#bannerIndicators"
      data-bs-slide-to={index}
      className={active ? "active" : ""}
      aria-current={active}
    />
  );
}

function BannerImage({ image, active, header, text }) {
  return (
    <div className={`carousel-item ${active ? "active" : ""}`}>
      <div
        className="ratio"
        style={{ "--bs-aspect-ratio": "50%", maxHeight: "460px" }}
      >
        <img className="d-block w-100 h-100 bg-dark cover" alt="" src={image} />
      </div>
      <div className="carousel-caption d-lg-block">
        <h5>{header}</h5>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Banner() {
  useEffect(() => {
    const carouselElement = document.getElementById("bannerIndicators");
    new bootstrap.Carousel(carouselElement, {
      interval: 3000, // Auto-move every 3 seconds
      ride: "carousel",
    });
  }, []);

  return (
    <div
      id="bannerIndicators"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="3000"
      style={{ marginTop: "56px" }}
    >
      <div className="carousel-indicators">
        <BannerIndicator index="0" active={true} />
        <BannerIndicator index="1" />
        <BannerIndicator index="2" />
      </div>
      <div className="carousel-inner">
        <BannerImage
          image={BannerZero}
          active={true}
          header="SHOP WITH US TODAY!"
          text="We offer affordable prices for high-quality goods."
        />
        <BannerImage
          image={BannerOne}
          header="WE OFFER PRINTING SERVICES"
          text="Some of our satisfied customers."
        />
        <BannerImage
          image={BannerTwo}
          header="Find the Jersey you want NOW"
          text="We offer original jerseys only."
        />
      </div>

      {/* Removed navigation buttons */}
    </div>
  );
}

export default Banner;
