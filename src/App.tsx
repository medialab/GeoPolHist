import React, { useCallback, useContext } from "react";
import { map } from "ramda";
import { HashRouter as Router, Route, Link } from "react-router-dom";
import Select from "react-select";
import sort from "ramda/es/sort";
import take from "ramda/es/take";
import pathOr from "ramda/es/pathOr";

import "./App.css";
import Country from "./Country";
import AppContextProvider, { AppContext } from "./AppContext";
import { RouterProps } from "react-router";
import { TopMenu } from "./TopMenu";

import { HashLink } from "react-router-hash-link";

const countriesToOptions = map((country: Entity) => ({
  value: country.id,
  label: country.name,
}));

const sortByOccupation = sort(
  (a: Entity, b: Entity) => b.occupations.size - a.occupations.size
);

const getCol = pathOr(0, ["campainsMap", "col", "length"]);

const sortByColonyNumber = sort(
  (a: Entity, b: Entity) => getCol(b) - getCol(a)
);

const filterSortByDis = (entities: Entity[]) => {
  const sortByOccEndDate = sort(
    (a: WLink, b: WLink) => b.end_year > a.end_year
  );
  const sortByEndDate = sort((a: Entity, b: Entity) => b.end > a.end);
  return sortByEndDate(
    entities.filter(
      (e) =>
        sortByOccEndDate([...e.occupations.values()])[0].status.slug === "dis"
    )
  );
};

const takeTop5 = take(5);

const Examples: React.FC<{ entities: Entity[] }> = (props) => {
  const mostOccupied: Entity[] = takeTop5(sortByOccupation(props.entities));
  const mostCollonies: Entity[] = takeTop5(sortByColonyNumber(props.entities));
  const disapeared: Entity[] = takeTop5(filterSortByDis(props.entities));

  const yearFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric" });
  return (
    <div>
      <div className="line">
        <div className="grow">
          <h3>Biggest number of sovereigns</h3>
          <ol>
            {mostOccupied.map((entity) => (
              <li key={entity.id}>
                <Link to={`/country/${entity.id}`}>
                  {entity.name} - {entity.occupations.size} sovereigns
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="grow">
          <h3>Biggest number of colonies</h3>
          <ol>
            {mostCollonies.map((entity) => (
              <li key={entity.id}>
                <Link to={`/country/${entity.id}`}>
                  {entity.name} - {getCol(entity)} colonies
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="grow">
          <h3>Most recently dissolved</h3>
          <ol>
            {disapeared.map((entity) => (
              <li key={entity.id}>
                <Link to={`/country/${entity.id}`}>
                  {entity.name} - {yearFormat.format(entity.end)}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {/* <h3>Countries by status</h3>
      <div className='line'>
        {values(state.status).map(status => {
          const getNb = pathOr(0, ['campainsMap', status.slug, 'length']);
          const sortByStatus = sort((a, b) => getNb(b) - getNb(a));
          return (
            <div key={status.slug} className='grow'>
              <h3>counties with most {status.GPH_status}:</h3>
              <ol>
                {takeTop5(sortByStatus(props.entities)).map(entity => {
                  return <li key={entity.id}><Link to={`/country/${entity.id}`}>{entity.name}</Link></li>
                })}
              </ol>
            </div>
          );
        })}
      </div> */}
    </div>
  );
};

const Home: React.FC<RouterProps> = (props) => {
  const { state }: { state: GlobalState } = useContext(AppContext);
  const onChange = useCallback(
    (event) => {
      props.history.push(`/country/${event.value}`);
    },
    [props.history]
  );
  return (
    <>
      <TopMenu />

      <div className="container container--home">
        <h1>
          Geopolitical entities of the world
          <br />
          by political status since 1816
        </h1>
        <p>
          GeoPolHist is a quantitative tool that focuses on the questions <b>“what
          is a country?”</b> and <b>“how many countries are there in the world?”</b> Created from the lists
          of{" "}
          <a href="https://correlatesofwar.org/data-sets/state-system-membership">
            states
          </a>{" "}
          and{" "}
          <a href="https://correlatesofwar.org/data-sets/colonial-dependency-contiguity">
            dependencies
          </a>{" "}
          built by the Correlates of War project, GeoPolHist provides a dataset and visual documentation that identifies the
          political status of each of the geopolitical entities that existed in
          the world since 1816. It allows for an approach of the political
          history of the world based on the dichotomy between sovereign and
          non-sovereign entities.
        </p>
        <p>
          See the <HashLink to="#methodology">methodology</HashLink> and{" "}
          <HashLink to="#dataset">data set</HashLink> sections to learn more.
        </p>

        <h2 id="explore">Explore Geopolitical entities</h2>

        <Select
          placeholder={
            state.entities.length
              ? "Search for a Geopolitical entity"
              : "Still loading"
          }
          onChange={onChange}
          options={countriesToOptions(state.entities)}
          theme={(theme) => ({
            ...theme,
            borderRadius: 5,
            colors: {
              ...theme.colors,
              primary25: "lightgrey",
              primary: "grey",
              background: "white",
              color: "black",
            },
          })}
        />
        {state.entities.length ? (
          <Examples entities={state.entities} />
        ) : (
          <p>Data is still loading...</p>
        )}

        <h2>Three periods in the political history of the world since 1816</h2>
        <p>
          Over the last two centuries, the political situation of the world can be described
          as a developmental process in three phases during which one <a href="./data/GeoPolHist_status.csv">status</a> predominated.
          From 1816 to the Berlin Conference in 1884/85, 14% of the
          geopolitical entities of the world were sovereign (unrecognized); from
          1886 to 1949, 20% were ‘colony’, ‘possession or ‘protectorate’’;
          since 1950, 16% are ‘sovereign’ (in the strict sense).
        </p>
        <iframe
          title="GPH status evolutions in 1816,1885,1950 and 2020"
          src="./sankey.html"
        ></iframe>
        <p style={{ textAlign: "center" }}>
          <a href="./sankey.html">open the diagram in full screen</a>
        </p>
        <h2 id="methodology">Methodology</h2>
        <p>
          A geopolitical entity is any form of human social community or territory that has been involved in an international or intra-national conflict during the post-Napoleonic period and is also geographically based. These entities are “political” in the Aristotelian sense of the political order, whose ultimate goal is to maintain peace through justice within the entity, while war and conflicts remain a possibility outside the limits of the entity. Throughout the period covered by the GPH database, political entities of the “human social community” type have taken the form of the tribe, chiefdom, city-state, kingdom, empire, seigneury, or nation. GPH entities may or may not be sovereign and independent. Political entities of the “territory” type are made up of uninhabited islands, atolls or reefs.
        </p>
        <p>
          The GeoPolHist dataset will be fully described in the paper{" "}
          <i>
            "How many countries in the world? The geopolitical entities of the
            world and their political status from 1816 to the present"
          </i>{" "}
          which is currently under review
        </p>
        <h2 id="dataset">GeoPolHist data set</h2>
        <p>
          The GeoPolHist data set is published under ODbl licence:
          <ul>
            <li>
              <a href="./data/GeoPolHist_status.csv">GeoPolHist_status.csv</a> -
              list of political status and their definition;
            </li>
            <li>
              <a href="./data/GeoPolHist_entities.csv">
                GeoPolHist_entities.csv
              </a>{" "}
              - list of GPH entities;
            </li>
            <li>
              <a href="./data/GeoPolHist_entities_status_over_time.csv">
                GeoPolHist_entities_status_over_time.csv
              </a>{" "}
              - list of GPH entities by political status over time;
            </li>
          </ul>
        </p>

        <p>
          The data set is versioned and fully documented in the{" "}
          <a href="https://github.com/medialab/GeoPolHist">
            GeoPolHist datapackage repository
          </a>
        </p>
        <p> To cite the dataset:
          <blockquote>Béatrice Dedinger, & Paul Girard. (2021). GeoPolHist dataset (Version 202103) [Data set]. Zenodo. <a href="http://doi.org/10.5281/zenodo.4600809">http://doi.org/10.5281/zenodo.4600809</a></blockquote>
          <a href="https://doi.org/10.5281/zenodo.4600809"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.4600809.svg" alt="DOI"/></a>
        </p>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContextProvider>
        <Router
          basename={process.env.NODE_ENV === "production" ? "/GeoPolHist" : "/"}
        >
          <Route path="/" exact component={Home} />
          <Route path="/country/:id" component={Country} />
        </Router>
      </AppContextProvider>
    </div>
  );
};

export default App;
