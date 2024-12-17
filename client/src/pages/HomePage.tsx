import React from 'react'
// import Header from 'components/Header'

const HomePage = () => {
    return (
        <div className="font-sans text-gray-900">
            {/* Header */}

            {/* Banner */}
            <section className="w-full">
                <img
                    src="https://file.hstatic.net/200000692767/collection/banner_website_tet_2025_digital_mkt_2136x569_copy_2_3a3c1d738a73446a9d1848cf580cc0a8.jpg"
                    alt="Banner"
                    className="w-full h-96 object-cover"
                />
            </section>

            {/* Participants Section */}
            <section className="bg-white py-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-center md:gap-8">
                    {/* Participant Info */}
                    <div className="flex items-center border border-gray-200 p-8 gap-6 mb-6 md:mb-0 w-full md:w-1/2">
                        <img
                            src="https://scontent.fsgn2-8.fna.fbcdn.net/v/t39.30808-6/456712306_3743500985926189_3448795014745357263_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=qEaIkbHSGLkQ7kNvgFckG_x&_nc_oc=AdhngXf45O8pozjf-dfUjqrtZeMHq0cSYPswCS9csKWtrSZcugQvnNTrjnCvOXzXUgSu7Sv5MWV3MBJnbsiqa6oC&_nc_zt=23&_nc_ht=scontent.fsgn2-8.fna&_nc_gid=AMB6P5Gb63iorgMvTMYaaSL&oh=00_AYAXdswL84Ccj5OIIwaLhpvQrDAllUWHuo6uRu3odKFUkg&oe=676789C1"  // Thay bằng hình ảnh thực tế của người tham gia
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

export default HomePage
