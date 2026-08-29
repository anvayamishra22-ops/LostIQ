import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} LOSTIQ – Smart Lost & Found Portal. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-light)' }}>
          Designed for B.Tech Project Viva Evaluation
        </p>
      </div>
    </footer>
  );
};

export default Footer;
