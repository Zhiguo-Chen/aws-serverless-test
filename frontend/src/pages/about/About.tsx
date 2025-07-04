import './About.scss';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Us</h1>
        <p className="about-subtitle">
          We are committed to providing the best e-commerce experience for
          everyone.
        </p>
      </div>
      <div className="about-section">
        <div className="about-description">
          <p>
            Our platform brings together top-quality products, excellent
            customer service, and a seamless shopping experience. We believe in
            innovation, trust, and customer satisfaction.
          </p>
        </div>
      </div>
      <div className="about-values">
        <div className="about-value-card">
          <h3>Our Mission</h3>
          <p>To make online shopping easy, safe, and enjoyable for everyone.</p>
        </div>
        <div className="about-value-card">
          <h3>Our Vision</h3>
          <p>To become the most trusted e-commerce platform worldwide.</p>
        </div>
        <div className="about-value-card">
          <h3>Our Values</h3>
          <p>Integrity, Innovation, Customer First.</p>
        </div>
      </div>
      {/* 可选：团队成员区 */}
      {/* <div className="about-team">
        <h2>Meet Our Team</h2>
        <div className="about-team-list">
          <div className="about-team-member">
            <img src="/team1.jpg" alt="Team Member" />
            <div>Jane Doe<br /><span>CEO</span></div>
          </div>
          ...
        </div>
      </div> */}
    </div>
  );
};

export default About;
