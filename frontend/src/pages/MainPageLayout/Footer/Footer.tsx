import React from 'react';
import './Footer.scss';
import { Input } from 'antd';
import googlePlay from '../../../assets/images/google-play-store.png';
import appStore from '../../../assets/images/appstore.png';
import qrCode from '../../../assets/images/QrCode.png';
import { ReactComponent as SuffixIcon } from '../../../assets/icons/input-icon.svg';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Exclusive</h3>
          <h4>Subscribe</h4>
          <p>Get 10% off your first order</p>
          <div className="email-input">
            <Input
              placeholder="Enter your email"
              suffix={
                <span className="suffix-icon">
                  <SuffixIcon />
                </span>
              }
            />
          </div>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <address>
            111 Bijoy sarani, Dhaka,
            <br />
            DH 1515, Bangladesh.
          </address>
          <p>exclusive@gmail.com</p>
          <p>+88015-88888-9999</p>
        </div>

        <div className="footer-section">
          <h3>Account</h3>
          <ul>
            <li>
              <a href="/account">My Account</a>
            </li>
            <li>
              <a href="/login">Login / Register</a>
            </li>
            <li>
              <a href="/cart">Cart</a>
            </li>
            <li>
              <a href="/wishlist">Wishlist</a>
            </li>
            <li>
              <a href="/shop">Shop</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Quick Link</h3>
          <ul>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms Of Use</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Download App</h3>
          <p>Save $3 with App New User Only</p>
          <div className="download-section">
            <div className="qr-code">
              <img src={qrCode} alt="QR Code" />
            </div>
            <div className="store-buttons">
              <img src={googlePlay} alt="Get it on Google Play" />
              <img src={appStore} alt="Download on App Store" />
            </div>
          </div>
          <div className="social-icons">
            <a href="#">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copyright">
          © Copyright Rimel 2022. All right reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
