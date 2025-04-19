import HeroSection from '../../Components/HeroSection';
import CtaSection from '../../Components/CtaSection.jsx';
import About from '../../Components/About/index.jsx';
import CounterSection from '../../Components/FunSection/CounterSection.jsx';
import Service from '../../Components/Service/index.jsx';
import TeamSection from '../../Components/TeamSection/index.jsx';
import BrandsSlider from '../../Components/BrandsSection/index.jsx';
import ChooseUs from '../../Components/ChooseUs/index.jsx';
import ProjectSection from '../../Components/ProjectSection/index.jsx';
import CtaSection1 from '../../Components/CtaSection.jsx/CtaSection1.jsx';
import MedicalTabSection from '../../Components/MedicalTabSection/index.jsx';
import BlogSection from '../../Components/BlogsSection/index.jsx';
import Section from '../../Components/Section/index.jsx';
import ContactSection2 from '../../Components/ContactSection/ContactSection2.jsx';

const heroData = {
  primarySlider: [
    {
      bgImageUrl: 'assets/img/background.jpg',
      contactTitle: 'VÌ SỨC KHỎE GIA ĐÌNH BẠN',
      contact: 'Liên hệ : (+84) 123 456 789',
      link2: '/contact'
    },
    {
      bgImageUrl: 'assets/img/hero_slider_2.jpg',
      title: 'Your Center for <br>Mental <span>Health.</span>',
      contactSubtitle:
        'Medical ers piciatis unde omnis iste natus this the word medical this mountains, far from the countries Vokalia and, live the docor white teeth sitting on a dental for best medical.',
      contactTitle: 'Receive Medical Service.',
      contact: 'Call Us at: (+2) 56 54 1453',
      btnText1: 'Contact Now',
      link: '/contact',
      btnText2: 'Discover More',
      link2: '/about',
      iconImgUrl: 'assets/img/icons/hero_icon.png',
    },
    {
      bgImageUrl: 'assets/img/hero_slider_1.jpg',
      title: 'We Hospital Doctors Patients <span>Service.</span>',
      contactSubtitle:
        'Medical ers piciatis unde omnis iste natus this the word medical this mountains, far from the countries Vokalia and, live the docor white teeth sitting on a dental for best medical.',
      contactTitle: 'Receive Medical Service.',
      contact: 'Call Us at: (+2) 56 54 1453',
      btnText1: 'Contact Now',
      link: '/contact',
      btnText2: 'Discover More',
      link2: '/about',
      iconImgUrl: 'assets/img/icons/hero_icon.png',
    },
  ],
};

const ctaData = {
  imageUrl: '/assets/img/cta_img_1.png',
  title: 'TƯ VẤN SỨC KHỎE TRỰC TUYẾN CÙNG BÁC SĨ',
  buttonUrl: '/BookingAppointments',
  buttonText: 'Đặt lịch ngay ',
};

const aboutData = {
  sectionSubtitle: 'VỀ CHÚNG TÔI',
  sectionTitle: '20 năm chăm sóc sức khỏe cộng đồng',
  aboutText:
    'Với hơn 20 năm hình thành và phát triển, Phòng khám Đa khoa AMMA tự hào là điểm đến tin cậy của hàng ngàn bệnh nhân trong và ngoài khu vực. Chúng tôi vinh dự được hợp tác cùng các chuyên gia, bác sĩ giàu kinh nghiệm và không ngừng cập nhật các thiết bị, công nghệ y tế hiện đại nhằm mang đến dịch vụ khám chữa bệnh chất lượng cao.',
  service:
    "AMMA luôn đặt sự an toàn, thoải mái và hài lòng của người bệnh lên hàng đầu trong mọi hoạt động khám – chữa – chăm sóc sức khỏe.",
  experienceYears: '20+',
  experienceTitle: 'Kinh Nghiệm',
  
  iconboxes: [

  ],

  sectionImgUrl: 'assets/img/about_section_img_1.png',
  headImgUrl: 'assets/img/about_img_1.jpg',
};

// const countersData = [
//   {
//     iconUrl: '/assets/img/icons/counter_icon_1.png',
//     number: '50K+',
//     title: 'Bệnh nhân đang điều trị',
//   },
//   {
//     iconUrl: '/assets/img/icons/counter_icon_2.png',
//     number: '23K+',
//     title: 'Lượt tư vấn & hỗ trợ',
//   },
//   {
//     iconUrl: '/assets/img/icons/counter_icon_3.png',
//     number: '45K',
//     title: 'Ca điều trị thành công',
//   },
//   {
//     iconUrl: '/assets/img/icons/counter_icon_4.png',
//     number: '20+',
//     title: 'Năm hoạt động và phát triển',
//   },
// ];



const sectionData = {
  subtitle: 'HƯỚNG DẪN KHÁM BỆNH',
  title: 'HƯỚNG DẪN ĐẶT LỊCH KHÁM TRỰC TUYẾN',
  services: [
    {
      iconUrl: '/assets/img/icons/service_icon_9.png',
      title: 'Đăng nhập vào hệ thống',
    },
    {
      iconUrl: '/assets/img/icons/service_icon_10.png',
      title: 'Chọn bác sĩ',
      
    },
    {
      iconUrl: '/assets/img/icons/service_icon_11.png',
      title: 'Truy cập trang đặt lịch',
      
    },
    {
      iconUrl: '/assets/img/icons/service_icon_12.png',
      title: 'Chọn ngày giờ khám',
    },
    {
      iconUrl: '/assets/img/icons/service_icon_13.png',
      title: 'Nhập thông tin cá nhân',
    },
    {
      iconUrl: '/assets/img/icons/service_icon_14.png',
      title: 'Xác nhận & hoàn tất',
    },
  ],
};

const projectData = {
  title: 'All The Great Work That<br> Medical Service',
  subtitle: 'OUR PORTFOLIO',
  description:
    'We are privileged to work with hundreds of future-thinking medial, including many of the world’s top hardware, software, and brands, feel safe and comfortable in establishing.',
  tabs: [
    { id: 'dental', label: 'Dental' },
    { id: 'cardiology', label: 'Cardiology' },
    { id: 'neurology', label: 'Neurology' },
    { id: 'medical', label: 'Medical' },
  ],
  tabData: [
    {
      id: 'dental',
      items: [
        {
          imgUrl: '/assets/img/project_1.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_2.jpg',
          title: 'Medical Of Dental',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 2,
        },
        {
          imgUrl: '/assets/img/project_3.jpg',
          title: 'Laboratory Technologist',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 3,
        },
      ],
    },
    {
      id: 'cardiology',
      items: [
        {
          imgUrl: '/assets/img/project_1.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_3.jpg',
          title: 'Laboratory Technologist',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 3,
        },
        {
          imgUrl: '/assets/img/project_2.jpg',
          title: 'Medical Of Dental',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 2,
        },
      ],
    },
    {
      id: 'neurology',
      items: [
        {
          imgUrl: '/assets/img/project_1.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_3.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_2.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
      ],
    },
    {
      id: 'medical',
      items: [
        {
          imgUrl: '/assets/img/project_3.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_2.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
        {
          imgUrl: '/assets/img/project_1.jpg',
          title: 'Medical Of Working',
          subtitle:
            'We businesss standard chunk of Ipsum used since is Agency &amp; Star tup.',
          index: 1,
        },
      ],
    },
  ],
};

const ctaData1 = {
  videoLink: 'https://www.youtube.com/embed/rRid6GCJtgc',
  videoButtonText: 'WATCH VIDEO',
  subtitle: 'OUR WATCH VIDEO',
  title: 'Professional Medical Care Measure Medical.',
  description:
    'We are privileged to work with hundreds of future-thinking medial, including many of the world’s top hardware, software, and brands , feel safe and comfortable in establishing.',
  buttonLink: '/contact',
  buttonText: 'Video More',
  brandImage: 'assets/img/medical_brand.png',
};



const MainHome = () => {
  return (
    <>
      {/* End Header Section */}
      {/* Start Hero Section */}
      <HeroSection data={heroData} />
      {/* End Hero Section */}
      {/* Start CTA Section */}
      <Section
        className={
          'cs_cta cs_style_1 cs_blue_bg position-relative overflow-hidden'
        }
      >
        <CtaSection data={ctaData} />
      </Section>

      {/* End CTA Section */}
      {/* Start About Section */}
      <Section
        topSpaceLg="80"
        topSpaceMd="120"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className="cs_about cs_style_1 position-relative"
      >
        <About data={aboutData} />
      </Section>

      
      {/* <Section className="cs_counter_area cs_gray_bg">
        <CounterSection data={countersData} />
      </Section> */}

      
{/* 
      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className={'cs_gray_bg'}
      >
        
      </Section> */}

      

      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        className={'cs_team_section position-relative'}
      >
      </Section> 
      

      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className="cs_gray_bg cs_bg_filed"
        // backgroundImage="/assets/img/service_bg_2.jpg"
      >
        <ChooseUs data={sectionData} />
      </Section>

     


    

      

      
      {/* <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
      >
        <BlogSection data={blogsData} />
      </Section> */}
    </>
  );
};

export default MainHome;
