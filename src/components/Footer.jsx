import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; 2025{" "}
          <a
            href="https://selective-raft-f01.notion.site/1b1b9736465580578a5bf5be4d4418d4?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-link-primary"
          >
            <strong>Cindy Mikoda</strong>
          </a>
          {" — "}
          <a
            href="https://github.com/cindymikoda/movie-app"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub Repository
          </a>
          {" | "}
          <a
            href="https://movie-aqybjz4pl-cindys-projects-d1e14e3d.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Live on Vercel
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
