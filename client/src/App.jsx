import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import LayoutWithoutHeader from './components/Layout/LayoutWithoutHeader';
import MainHome from './Pages/HomePage/MainHome';
import HomeV2 from './Pages/HomePage/HomeV2';
import HomeV3 from './Pages/HomePage/HomeV3';
import AboutPage from './Pages/AboutPage/AboutPage';
import LoginPage from './pages/AuthenPage/LoginPage';
import RegisterPage from './pages/AuthenPage/RegisterPage';
import VerifyPage from './pages/AuthenPage/VerifyPage';
import ServicePage from './Pages/Service/ServicePage';
import ServiceDetails from './Pages/Service/ServiceDetails';
import BlogsPage from './Pages/BlogsPage/BlogsPage';
import BlogsDetails from './Pages/BlogsPage/BlogsDetails';
import DoctorsPage from './Pages/Pages/DoctorsPage';
import DoctorsDetailsPage from './Pages/Pages/DoctorsDetailsPage';
import TimeTablePage from './Pages/Pages/TimeTablePage';
import PortfolioPage from './Pages/Pages/PortfolioPage';
import ErrorPage from './Pages/Pages/ErrorPage';
import ContactPage from './Pages/ContactPage/ContactPage';
import Appointments from './Pages/Pages/Appointments';
import AppointmentsHistory from './Pages/Pages/AppointmentsHistory';
import UpdateAppointment from './Pages/Pages/UpdateAppointment';
import DoctorAppointments from './Pages/Pages/DoctorAppointments';
import AppointmentDetail from './Pages/Pages/AppointmentDetail';
import ScrollUpButton from './Components/ScrollUpButton';
import DoctorsResultPage from './Pages/Pages/DoctorsResultPage';
import 'aos/dist/aos.css';
import Aos from 'aos';
import { useEffect } from 'react';

function App() {
  Aos.init({
    duration: 1500,
    delay: 0.25,
    disable: 'mobile',
  });
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout isTopBar={true} />}>
          <Route index element={<MainHome />} />
          <Route path="/home-v2" element={<HomeV2 />} />
        </Route>
        <Route path="/" element={<Layout variant="cs_type_1" />}>
          <Route path="/home-v3" element={<HomeV3 />} />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/service/:serviceId" element={<ServiceDetails />} />
          <Route path="/blog" element={<BlogsPage />} />
          <Route path="/blog/:blogId" element={<BlogsDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointmentshistory" element={<AppointmentsHistory />} />
          <Route path="/updateappointment/:appointmentId" element={<UpdateAppointment />} />
          <Route path="/doctorappointments" element={<DoctorAppointments />} />
          <Route path="/appointment/:id" element={<AppointmentDetail />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:doctorId" element={<DoctorsDetailsPage />} />
          <Route path="/timetable" element={<TimeTablePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<ErrorPage />} />
          <Route path="/search" element={<DoctorsResultPage />} />
        </Route>
        <Route path="/" element={<LayoutWithoutHeader />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Route>
      </Routes>
      <ScrollUpButton />
    </>
  );
}

export default App;
