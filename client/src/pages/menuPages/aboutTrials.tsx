import React from 'react'
// import AssistantSharpIcon from '@mui/material';

const aboutTrials = () => {
    return (
        <div className="font-sans text-gray-900">

            {/* Breadcrumb Section */}
            <nav className="bg-white py-3 px-4">
                <div className="max-w-6xl mx-auto text-sm text-gray-600">
                    <a href="/" className="hover:text-blue-600">Home</a>
                    <span className="mx-2">/</span>
                    <a href="/menu" className="hover:text-blue-600">Menu</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">About Clinical Trials</span>
                </div>
            </nav>

            {/* Content Section */}
            <section className="bg-white py-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-center md:gap-8">
                    {/* Video */}
                    <div className="text-center md:text-left w-full md:w-[1000px]">
                        <video controls className="max-w-full rounded-lg mb-4 md:mb-0" width="100%" height="300">
                            <source src="path/to/video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <p className="font-semibold mt-4">Breakthroughs for tomorrow start today</p>
                        <p className="mt-4"> Your participation will help make the progress possible</p>
                    </div>
                </div>
            </section>

            {/* Chatbox */}
            {/* <AssistantSharpIcon></AssistantSharpIcon> */}

            {/* Cookie Preferences */}
            {/* <footer className="bg-teal-100 py-6 px-4 flex justify-between items-center flex-wrap">
                <p className="text-gray-700 text-sm md:text-base">
                    This Site uses Cookies & Your Privacy Choice Is Important to Us. Choose Customize My Settings to make your
                    privacy choices. Choose Accept All Cookies to accept third party cookies. <strong>See our Privacy Policy</strong>
                </p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <button className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-600">Customize My Settings</button>
                    <button className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-600">Accept All Cookies</button>
                </div>
            </footer> */}
        </div>
    )
}

export default aboutTrials
