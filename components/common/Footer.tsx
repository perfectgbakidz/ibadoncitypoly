import React from 'react';
import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 body-font z-20">
      <div className="container px-5 py-4 mx-auto flex items-center sm:flex-row flex-col">
        <p className="text-sm text-slate-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-slate-200 sm:py-2 sm:mt-0 mt-4">
          © 2024 Ibadan City Polytechnic —
          <a href="https://twitter.com/polyibadan" className="text-slate-600 ml-1" rel="noopener noreferrer" target="_blank">@polyibadan</a>
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link to="/terms" className="text-sm text-slate-500 hover:text-green-600">Terms & Conditions</Link>
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-green-600">Privacy Policy</Link>
        </nav>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            {SOCIAL_LINKS.map(link => (
                <a key={link.name} href={link.href} className="text-slate-500 hover:text-green-600 ml-3">
                    {link.icon}
                </a>
            ))}
        </span>
      </div>
    </footer>
  );
};

export default Footer;