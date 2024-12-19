import React from 'react';

const CookiePolicy: React.FC = () => {
    return (
        <div className="bg-white p-8">
            <div className="px-8 py-2 text-gray-500 text-sm">
                Home <span className="text-teal-600">&gt; Cookie Policy</span>
            </div>

            <main className="px-8 py-6">
                <h1 className="text-2xl font-bold text-teal-600">Cookie Policy</h1>

                <section className="mt-4">
                    <h2 className="font-bold">Strictly Necessary Cookies</h2>
                    <p className="text-gray-600 mt-1">
                        Functional Cookies <br />
                        Performance Cookies <br />
                        Targeting Cookies <br />
                        Social Media Cookies <br />
                    </p>
                </section>

                <section className="mt-6">
                    <h2 className="font-bold">Strictly Necessary Cookies</h2>
                    <p className="text-gray-600 mt-1">
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default CookiePolicy;
