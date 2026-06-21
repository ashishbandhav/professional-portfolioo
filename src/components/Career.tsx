import "./styles/Career.css";
import { config } from "../config";

const getDisplayYear = (period: string) => {
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) {
    // If it's like "April - June 2024", show "2024"
    const parts = period.split(" - ");
    const lastPart = parts[1];
    const yearMatch = lastPart.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : lastPart;
  }
  // If it's a single year like "2025" or "Since August 2023"
  const yearMatch = period.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : period;
};

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {config.experiences.map((exp, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.position}</h4>
                  <h5>{exp.company}</h5>
                </div>
                <h3>{getDisplayYear(exp.period)}</h3>
              </div>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
        <div className="photo-carousel-section">
          <h2 className="photo-carousel-title">Gallery</h2>
          <div className="photo-carousel-wrapper">
            <div className="photo-carousel-track">
              {[...config.certificationImages, ...config.certificationImages].map((src, index) => (
                <div key={index} className="photo-item">
                  <img src={src} alt={`photo-${index}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
