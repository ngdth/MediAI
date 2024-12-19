import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white p-8">
      <div className="px-8 py-2 text-gray-500 text-sm">
        Home <span className="text-teal-600">&gt; About Us</span>
      </div>

      <main className="px-8 py-6">
        <h1 className="text-2xl font-bold text-teal-600">About Us</h1>

        <section className="mt-6">
          <h2 className="font-bold">Our mission</h2>
          <p className="text-gray-600 mt-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="font-bold">Our vision</h2>
          <p className="text-gray-600 mt-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="font-bold">Our values</h2>

          <div className="mt-2 space-y-2">
            <p><em className="font-semibold">Service</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p><em className="italic">Integrity</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p><em className="font-semibold">Respect</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p><em className="italic">Innovation</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p><em className="italic">Teamwork</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;
