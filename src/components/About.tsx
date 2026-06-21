import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-content-wrapper">
        <div className="about-me">
          <h3 className="title">{config.about.title}</h3>
          <p className="para">
            {config.about.description}
          </p>
        </div>
        <div className="about-photo">
          <img src={config.developer.photo} alt={config.developer.fullName} />
        </div>
      </div>
    </div>
  );
};

export default About;
