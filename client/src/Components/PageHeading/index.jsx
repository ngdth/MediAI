import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PageHeading = ({ data }) => {
  const [urlSegments, setUrlSegments] = useState([]);
  useEffect(() => {
    const pathSegments = window.location.pathname
      .split("/")
      .filter((segment) => segment !== "");
    setUrlSegments(pathSegments);
  }, []);
  return (
    <div className="container">
      <h1 className="cs_page_title" style={{color:"#03609e"}}>{data?.title}</h1>
    </div>
  );
};

export default PageHeading;
