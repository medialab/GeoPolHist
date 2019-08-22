import React, { useContext, useCallback } from 'react';

import equals from 'ramda/es/equals';
import { Link, useNavigation } from 'react-navi';
import { AppContext } from './AppContext';
import MultiMap from 'mnemonist/multi-map';
import Timelines from './timeline-r';

const Country: React.FC<{
  id: string,
}> = ({id}) => {
  const {state}: {state: GlobalState} = useContext(AppContext);
  const country = state.entities.find(entity => equals(entity.id, id));
  const navigation = useNavigation();
  const onOccupiedLinkClick = useCallback(link => {
    console.log(link);
    navigation.navigate(`/country/${link.sovereign.id}`)
  }, [navigation]);
  const onCampainsLinkClick = useCallback(link => {
    navigation.navigate(`/country/${link.COW_code}`)
  }, [navigation]);
  if (country === undefined) {
    return (<div>Loading</div>);
  }
  return (
    <div>
      <aside>
        <Link href='/'>Home</Link>
      </aside>
      <h1>{country.name}</h1>
      <h2>Territory masters</h2>
      <Timelines
        onLinkClick={onOccupiedLinkClick}
        intervalMinWidth={5}
        data={country.occupations as MultiMap<Entity, Link>}
        lineHeight={20}
        width={1000}
      />
      {/* <Histogram width={1000} height={300} data={Array.from(country.campains.values())} /> */}
      <h2>Occupying territories</h2>
      <Timelines
        onLinkClick={onCampainsLinkClick}
        intervalMinWidth={5}
        data={country.campains as MultiMap<Entity, Link>}
        lineHeight={20}
        width={1000}
      />
    </div>
  );
}

export default Country;
