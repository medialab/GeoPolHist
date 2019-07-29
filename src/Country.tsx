import React from 'react';

import { useCurrentRoute } from "react-navi";
import filter from 'ramda/es/filter';
import { xCowName, xSovereignCowName } from './utils';
import equals from 'ramda/es/equals';
import head from 'ramda/es/head';
import map from 'ramda/es/map';

const Country: React.FC<{
  id: number,
  data: Link[],
}> = ({id, data}) => {
  console.log('ca plante ou ?', id);
  const upperLinks = filter((link: Link) => equals(link.COW_code, id))(data);
  const lowerLinks = filter((link: Link) => equals(link.sovereign_COW_code, id))(data);
  console.log(upperLinks, lowerLinks);
  const country = head(upperLinks);
  console.log(upperLinks, country);
  const print = (lens: (link: any) => any) => map((link: Link) => {
    return (
      <li>{link.link_type} {lens(link)}</li>
    );
  });
  return <div>
    <h1>{country.COW_name}</h1>
    <h2>Territory masters</h2>
    <ul>
      {print(xSovereignCowName)(upperLinks)}
    </ul>
    <h2>Occupying territories</h2>
    <ul>
      {print(xCowName)(lowerLinks)}
    </ul>
  </div>;
}

export default Country;
