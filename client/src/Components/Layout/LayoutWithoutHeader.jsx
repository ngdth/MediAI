import { Outlet } from 'react-router-dom';
import Footer from '../Footer/Footer';

const LayoutWithoutHeader = () => {
  return (
    <div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default LayoutWithoutHeader;
