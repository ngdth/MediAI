import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="bg-teal-600 text-white text-sm py-4 px-8 mt-4 flex justify-between">
      <div>
        <Link to="/privacy" className="underline">Privacy Policy</Link> | <Link to="cookie" className="underline">Cookie Preferences</Link>
      </div>
      <div>
        Copyright &copy;2022 | XYZ company. All Rights Reserved.
      </div>
      <div className="flex gap-3">
        <a href="#"><img src="https://via.placeholder.com/20" alt="Facebook" /></a>
        <a href="#"><img src="https://via.placeholder.com/20" alt="YouTube" /></a>
        <a href="#"><img src="https://via.placeholder.com/20" alt="Twitter" /></a>
      </div>
    </div>
  );
};

export default Footer
