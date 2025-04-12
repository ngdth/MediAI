import PageHeading from '../../Components/PageHeading';
import ContactSection from '../../Components/ContactSection';
import Section from '../../Components/Section';
import LocationMap from '../../Components/LocationMap/Index';

const headingData = {
  backgroundImage: '/assets/img/page_heading_bg.jpg',
  title: 'Contact Us',
};

const contactData = {
  // sectionSubtitle: 'LIÊN HỆ VỚI CHÚNG TÔI',
  SectionTitle: 'LIÊN HỆ VỚI CHÚNG TÔI',
  teethShapeImg: 'assets/img/icons/hero_shape_3.png',
  contactImg: 'assets/img/contact_2.jpg',
  iconBox: {
    style: 'cs_style_4',
    icon: 'assets/img/icons/call_icon_1.png',
    title: 'Cuộc gọi khẩn cấp',
    subtitle: 'Hỗ trợ 24/7 – Tận tâm và nhanh chóng',
  },
};

const mapData = {
  mapSrc:
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1907.007862047606!2d108.26064446583678!3d15.96807791466579!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142116949840599%3A0x365b35580f52e8d5!2zxJDhuqFpIGjhu41jIEZQVCDEkMOgIE7hurVuZw!5e1!3m2!1svi!2s!4v1744203818738!5m2!1svi!2s',
};
const ContactPage = () => {
  return (
    <>
      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/page_heading_bg.jpg"
      >
        <PageHeading data={headingData} />
      </Section>

      <Section
        topSpaceLg="70"
        topSpaceMd="110"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
      >
        <ContactSection reverseOrder={true} data={contactData} />
      </Section>

      <Section bottomSpaceLg="0" bottomSpaceMd="0">
        <LocationMap mapSrc={mapData.mapSrc} />
      </Section>
    </>
  );
};

export default ContactPage;
