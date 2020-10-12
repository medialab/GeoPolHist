import React from "react";
import { Link } from "react-router-dom";

export const TopMenu: React.FC<{
  country?: Entity;
}> = (props) => {
  const { country } = props;
  return (
    <>
      <div className="topMenu">
        <span className="appTitle">
          <img src="./GeoPolHist.svg" />
          <Link to="/">GeoPolHist</Link>
        </span>
      </div>
    </>
  );
};
