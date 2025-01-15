import BannerZero from "./images/banner-0.jpg";
import BannerOne from "./images/banner-1.jpg";
import BannerTwo from "./images/banner-2.jpg";

function BannerIncidator(props) {
  return (
    <button
      type="button"
      data-bs-target="#bannerIndicators"
      data-bs-slide-to={props.index}
      className={props.active ? "active" : ""}
      aria-current={props.active}
    />
  );
}

function BannerImage(props) {
  return (
    <div
      className={"carousel-item " + (props.active ? "active" : "")}
      data-bs-interval="500"
    >
      <div
        className="ratio"
        style={{ "--bs-aspect-ratio": "50%", maxHeight: "460px" }}
      >
        <img
          className="d-block w-100 h-100 bg-dark cover"
          alt=""
          src={props.image}
        />
      </div>
      <div className="carousel-caption d-none d-lg-block">
        <h5>{props.header}</h5>
        <p>{props.text}</p>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div
      id="bannerIndicators"
      className="carousel slide"
      data-bs-ride="carousel"
      style={{ marginTop: "56px" }}
    >
      <div className="carousel-indicators">
        <BannerIncidator index="0" active={true} />
        <BannerIncidator index="1" />
        <BannerIncidator index="2" />
      </div>
      <div className="carousel-inner">
        <BannerImage
          image={BannerZero}
          active={true}
          header="SHOP WITH US TODAY!"
          text="we offer affordable prices for high quality goods."
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
    </div>
  );
}

export default Banner;