import React from 'react'

const HomePage = () => {
    return (
        <div className="font-sans text-gray-900">
            {/* Banner */}
            <section className="w-full">
                <img
                    src="https://placehold.co/1250x320"
                    alt="Banner"
                    className="w-full h-80 object-cover"
                />
            </section>

            {/* Participants Section */}
            <section className="bg-white py-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-center md:gap-8">
                    {/* Participant Info */}
                    <div className="flex items-center border border-gray-200 p-8 gap-6 mb-6 md:mb-0 w-full md:w-1/2">
                        <img
                            src="https://placehold.co/80"  // Thay bằng hình ảnh thực tế của người tham gia
                            alt="Participant"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="text-xl font-semibold">Participants Experience</h3>
                            <p className="text-gray-600 mt-2">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </div>
                    </div>

                    {/* Video */}
                    <div className="text-center md:text-left w-full md:w-1/2">
                        <video controls className="max-w-full rounded-lg mb-4 md:mb-0" width="100%" height="300">
                            <source src="path/to/video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <p className="font-semibold mt-4">Clinical Trials - Research, Enrollment</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
