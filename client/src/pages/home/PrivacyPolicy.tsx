import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white p-8">
            <div className="px-8 py-2 text-gray-500 text-sm">
                Home <span className="text-teal-600">&gt; Privacy Policy</span>
            </div>

            <main className="px-8 py-6">
                <h1 className="text-2xl font-bold text-teal-600">Privacy Policy</h1>

                <section className="mt-6">
                    <h2 className="font-bold">Privacy Begins with Trust..</h2>
                    <p className="text-gray-600 mt-1">
                        This notice describes how website, and its network of independent associated companies use your personal data.
                    </p>
                </section>

                <section className="mt-4">
                    <h2 className="font-bold">Transparency:</h2>
                    <p className="text-gray-600 mt-1">
                        •Personal data we collect <br />
                        •Sources of personal data <br />
                        •Use of your personal data, and the basis for such use <br />
                        •Sharing your personal data <br />
                        •Data retention <br />
                        •Your rights <br />
                    </p>
                </section>

                <section className="mt-4">
                    <h2 className="font-bold">Our values</h2>

                    <div className="mt-2 space-y-2">
                        <p><em className="font-semibold">Write to us:</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p><em className="italic">Integrity</em> <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p><em className="font-semibold">Email address:</em> <br /> Privacyoffice@gmail.com</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
