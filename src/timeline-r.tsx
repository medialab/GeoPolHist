import React from 'react';
import { scaleTime } from 'd3';

const Timelines: React.FC<{
  data: Map<Entity, Link[]>
}> = props => {
  const xScale = scaleTime().domain();
  return (
    <svg>

    </svg>
  );
}

export default Timelines;
