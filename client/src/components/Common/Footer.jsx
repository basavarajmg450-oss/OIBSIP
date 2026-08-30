import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>🍕 CrustCraft</h3>
          <p>Premium artisan pizzas crafted with fresh ingredients and delivered hot to your door. Experience the perfect blend of tradition and innovation.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/menu">Our Menu</Link>
          <Link to="/custom-pizza">Build Custom</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Track Order</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href="mailto:hello@crustcraft.com">hello@crustcraft.com</a>
          <a href="tel:+911234567890">+91 123 456 7890</a>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', paddingTop: '4px' }}>Mumbai, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CrustCraft. Built as Oasis Infobyte Level 3 Internship Project.</p>
      </div>
    </footer>
  );
}
