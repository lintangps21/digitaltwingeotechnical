"use client";

import { Linkedin, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Image
                  src="/logo/DTG/logo.png"
                  alt="Digital Twin Geotechnical"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-teal-600">Digital Twin Geotechnical</span>
            </div>
            <p className="max-w-md">
              Transforming geotechnical engineering with cutting-edge digital twin technology for smarter, safer infrastructure projects.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-teal-600 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById("services");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-teal-600 transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById("about");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-teal-600 transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById("contact");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-teal-600 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-teal-600 mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/digitaltwingeotechnical"
                className="w-10 h-10 rounded-lg bg-teal-100 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-teal-600 hover:text-teal-600" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=6281127012626&text=Hello%20DTG%20Geotech%20team%2C%20I%20would%20like%20to%20enquire%20about%20your%20Digital%20Twin%20solutions%20for%20geotechnical%20engineering.%20Could%20we%20schedule%20a%20brief%20call%20to%20discuss%20our%20current%20project%20requirements%3F&type=phone_number&app_absent=0"
                className="w-10 h-10 rounded-lg bg-teal-100 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 flex items-center justify-center transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-teal-600 hover:text-teal-600" />
              </a>
              <a
                href="mailto:info@dtgeotech.com?subject=Inquiry%3A%20Digital%20Twin%20Solutions%20for%20Geotechnical%20Project&body=Dear%20DTG%20Geotech%20Team%2C%0A%0AI%20am%20reaching%20out%20to%20learn%20more%20about%20your%20digital%20twin%20services%20and%20how%20they%20can%20be%20applied%20to%20our%20current%20geotechnical%20project.%0A%0APlease%20let%20me%20know%20your%20availability%20for%20a%20brief%20introduction%20call%20next%20week.%0A%0AThank%20you%2C%0A%5BYour%20Name%5D%0A%5BYour%20Company%5D"
                className="w-10 h-10 rounded-lg bg-teal-100 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 flex items-center justify-center transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-teal-600 hover:text-teal-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-teal-200 text-center text-teal-500">
          <p>© 2025 Digital Twin Geotechnical. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}