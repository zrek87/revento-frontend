import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-1 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/3 flex justify-start">
          <Image src="/logo.png" alt="Company Logo" width={80} height={40} />
        </div>

        <div className="md:w-1/3 flex justify-center text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Revento. All rights reserved.
          </p>
        </div>

        <div className="md:w-1/3 flex justify-end space-x-4">
          <Image
            className="icon-gray"
            src="/icons/visa.svg"
            alt="Visa"
            width={40}
            height={25}
          />
          <Image
            className="icon-gray"
            src="/icons/mastercard.svg"
            alt="MasterCard"
            width={40}
            height={25}
          />
          <Image
            className="icon-gray"
            src="/icons/apple-pay.svg"
            alt="Apple Pay"
            width={40}
            height={25}
          />
          <Image
            className="icon-gray"
            src="/icons/mada.svg"
            alt="Mada"
            width={40}
            height={25}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
