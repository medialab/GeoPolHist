import { createContext } from "react";
import { scaleOrdinal } from "d3-scale";

const ThemeContext = createContext({
  margins: {
    top: 50,
    right: 0,
    bottom: 50,
    left: 0
  },
  colorScale: scaleOrdinal(['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']),
});
