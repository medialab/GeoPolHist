import React, { useContext, useCallback } from 'react';

import equals from 'ramda/es/equals';
import { AppContext } from './AppContext';
import Timelines from './timeline';
import { Link, RouteComponentProps } from 'react-router-dom';

const Country: React.FC<{
  id: string,
} & RouteComponentProps<{
  id: string
}>> = (props) => {
  const {history} = props;
  const id = props.match.params.id;
  const {state}: {state: GlobalState} = useContext(AppContext);
  const country = state.entities.find(entity => equals(entity.id, id));
  const onOccupiedLinkClick = useCallback(link => {
    history.push(`/country/${link.sovereign.id}`);
  }, [history]);
  const onCampainsLinkClick = useCallback(link => {
    history.push(`/country/${link.COW_code}`);
  }, [history]);
  if (country === undefined) {
    return (<div>Loading</div>);
  }
  return (
    <div>
      <aside>
        <Link to='/'>Home</Link>
      </aside>
      <h1>{country.name}</h1>
      <h2>Territory masters</h2>
      <Timelines
        onLinkClick={onOccupiedLinkClick}
        intervalMinWidth={5}
        data={country.occupations}
        lineHeight={20}
        width={1000}
      />
      {/* <Histogram width={1000} height={300} data={Array.from(country.campains.values())} /> */}
      <h2>Occupying territories</h2>
      <Timelines
        onLinkClick={onCampainsLinkClick}
        intervalMinWidth={5}
        data={country.campains}
        lineHeight={20}
        width={1000}
      />
    </div>
  );
}

export default Country;
