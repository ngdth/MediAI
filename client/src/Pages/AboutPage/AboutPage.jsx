import React, { useState, useEffect } from 'react';
import About from '../../Components/About';
import CtaSection1 from '../../Components/CtaSection.jsx/CtaSection1';
import CounterSection2 from '../../Components/FunSection/CounterSection2';
import PageHeading from '../../Components/PageHeading';
import Section from '../../Components/Section';
import TeamSection from '../../Components/TeamSection';

const headingData = {
  title: 'VỀ CHÚNG TÔI',
};

const aboutData = {
  sectionSubtitle: 'GIỚI THIỆU CỦA CHÚNG TÔI',
  sectionTitle: 'Giới thiệu chung',
  aboutText:
    'Phòng khám Đa khoa AMMA được thành lập từ năm [năm thành lập], với sứ mệnh chăm sóc sức khỏe toàn diện cho cộng đồng bằng y đức, chuyên môn và sự tận tâm. Trải qua hơn 20 năm hoạt động, AMMA đã trở thành địa chỉ tin cậy của hàng ngàn bệnh nhân, với đội ngũ y bác sĩ giỏi chuyên môn, giàu kinh nghiệm cùng hệ thống cơ sở vật chất hiện đại. Chúng tôi cung cấp dịch vụ khám chữa bệnh đa dạng như nội khoa, nhi khoa, sản phụ khoa, tai mũi họng, da liễu và chẩn đoán hình ảnh – đảm bảo phục vụ người bệnh một cách nhanh chóng, chính xác và hiệu quả.',
  service:
    'AMMA luôn đặt sức khỏe và sự hài lòng của người bệnh lên hàng đầu. Với triết lý hoạt động dựa trên các giá trị cốt lõi: tận tâm – chuyên nghiệp – uy tín – hiện đại, chúng tôi cam kết mang lại dịch vụ y tế chất lượng cao, quy trình minh bạch và trải nghiệm thăm khám thoải mái, an toàn cho mỗi khách hàng. Không ngừng đổi mới và ứng dụng công nghệ, AMMA hướng đến việc trở thành phòng khám đa khoa hàng đầu được người dân tin tưởng lựa chọn trong hành trình chăm sóc sức khỏe lâu dài.',
  experienceYears: '20+',
  experienceTitle: 'Kinh nghiệm ',
  iconboxes: [],
  sectionImgUrl: 'assets/img/about_section_img_1.png',
  headImgUrl: 'assets/img/about_img_7.jpg',
};

const counterData = [
  {
    iconSrc: '/assets/img/icons/counter_icon_1.png',
    countTo: 567,
    suffix: '+',
    title: 'Bệnh nhân đang điều trị',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_2.png',
    countTo: 23,
    suffix: 'K+',
    title: 'Lượt tư vấn & hỗ trợ',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_3.png',
    countTo: 241,
    suffix: '+',
    title: 'Ca điều trị thành công',
  },
  {
    iconSrc: '/assets/img/icons/counter_icon_4.png',
    countTo: 20,
    suffix: 'K+',
    title: 'Năm hoạt động và phát triển',
  },
];

// const teamData = {
//   subtitle: 'OUR TEAM MEMBER',
//   title: ' Meet Our Specialist This <br />Doctor Meeting',
//   sliderData: [
//     {
//       name: 'Dr. Norma Pedric',
//       profession: 'Neurologist',
//       imageUrl: '/assets/img/team_1.jpg',
//       link: '/doctors/doctor-details',
//       facebook: '/',
//       pinterest: '/',
//       twitter: '/',
//       instagram: '/',
//     },
//     {
//       name: 'Dr. James Lewis',
//       profession: 'Neurologist',
//       imageUrl: '/assets/img/team_3.jpg',
//       link: '/doctors/doctor-details',
//       facebook: '/',
//       pinterest: '/',
//       twitter: '/',
//       instagram: '/',
//     },
//     {
//       name: 'Dr. Sophia Anderson',
//       profession: 'Neurologist',
//       imageUrl: '/assets/img/team_4.jpg',
//       link: '/doctors/doctor-details',
//       facebook: '/',
//       pinterest: '/',
//       twitter: '/',
//       instagram: '/',
//     },
//     {
//       name: 'Dr. Michael Thompson',
//       profession: 'Neurologist',
//       imageUrl: 'assets/img/team_5.jpg',
//       link: '/doctors/doctor-details',
//       facebook: '/',
//       pinterest: '/',
//       twitter: '/',
//       instagram: '/',
//     },
//     {
//       name: 'Dr. David Wilson',
//       profession: 'Neurologist',
//       imageUrl: '/assets/img/team_6.jpg',
//       link: '/doctors/doctor-details',
//       facebook: '/',
//       pinterest: '/',
//       twitter: '/',
//       instagram: '/',
//     },
//   ],
// };



const AboutPage = () => {

  return (
    <div className="about-page-area">
      {/* Các section hiện tại giữ nguyên */}
      <Section
        topSpaceMd="100"
      >
      </Section>

      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/banner-doctors.png"
      >
        <PageHeading data={headingData} />
      </Section>
      <Section
        topSpaceLg="70"
        topSpaceMd="120"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
        className={'cs_about cs_style_1 position-relative'}
      >
        <About data={aboutData} />
      </Section>
      <Section bottomSpaceLg="80" bottomSpaceMd="120" className="cs_counter_area_2">
        <CounterSection2 data={counterData} />
      </Section>

      {/* <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="0">
        <TeamSection hr={true} variant={'cs_pagination cs_style_2'} data={teamData} />
      </Section> */}

    </div>
  );
};

export default AboutPage;