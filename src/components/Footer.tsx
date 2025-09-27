"use client";
import React from 'react';

// Footer Components
import Container from './Container';
import FooterLogo from './footer/FooterLogo';
import QuickLinks from './footer/QuickLinks';
import SupportLinks from './footer/SupportLinks';
import ContactInfo from './footer/ContactInfo';
import FooterBottom from './footer/FooterBottom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <Container>
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {/* Company Info & Logo */}
            <div className="lg:col-span-1">
              <FooterLogo />
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <QuickLinks />
            </div>

            {/* Support */}
            <div className="lg:col-span-1">
              <SupportLinks />
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <FooterBottom />
      </Container>
    </footer>
  );
};

export default Footer;