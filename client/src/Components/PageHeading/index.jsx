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
      <ol className="breadcrumb text-capitalize">
        <li className="breadcrumb-item">
          <Link style={{color:"#03609e"}} to="/">Trang chủ</Link>
        </li>
        {urlSegments.map((segment, index) => (
          <li key={index} className="breadcrumb-item">
            {index < urlSegments.length - 1 ? (
              <Link to={`/${urlSegments.slice(0, index + 1).join("/")}`}>
                {segment}
              </Link>
            ) : (
              <span className="active">{segment}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PageHeading;
