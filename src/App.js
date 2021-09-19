/* eslint-disable no-multi-str */
/* eslint-disable default-case */
/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import { useState } from "react";
import "./App.css";
import { InfluxDB} from "@influxdata/influxdb-client";
import {
  Plot,
  timeFormatter,
  NINETEEN_EIGHTY_FOUR,
  fromFlux,
} from "@influxdata/giraffe";

const valueAxisLabel = "Temperature";


const fetchData = (setMethod, setFetching) => {
  const url = "http://localhost:8086";
  const bucket = "mydb";
  const org = "Norbye";
  const token = "oIS2kzaB5-lGq_Pgi4U_bCLtkJIgA46x_f3LIbni9rQ3aMyVYqjcqhWagGShfJzNfWKPFTzazPtywBlmuhxfgw==";
  const influxDB = new InfluxDB({
    url,
    token,
  });
  const fluxQuery =
  `from(bucket: "${bucket}")
  |> range(start: -60d)
  |> filter(fn: (r) => r["_measurement"] == "average_temperature")
  |> filter(fn: (r) => r["_field"] == "degrees")
  |> filter(fn: (r) => r["location"] == "santa_monica")
  |> aggregateWindow(every: 1d, fn: last, createEmpty: false)
  |> yield(name: "mean")`
  console.log("\n*** QUERY ***");
  const queryApi = influxDB.getQueryApi(org);

  let table = [];
  let csv = "";

  queryApi.queryLines(fluxQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },

    error(error) {
      setFetching("error");
      console.log("QUERY FAILED", error);
    },
    complete() {
      
      setMethod(fromFlux(csv));
      setFetching("fetched");
    },
  });
};

export default (props) => {
  console.log("Updating Component");
  console.log(props);

  const [table, setTable] = useState(null);
  const [fetching, setFetching] = useState("unfetched");
  let plotGraph = <p> Pending </p>;

  switch (fetching) {
    case "unfetched":
      console.log("unfetched");
      setFetching("fetching");
      fetchData(setTable, setFetching);
      break;

    case "error":
      console.log("error");
      plotGraph = <p> Error </p>;
    
      break;

    case "fetching":
      console.log("fetching");
      plotGraph = <p> Fetching </p>;
      
      break;

    case "fetched":
      console.log("fetched");
    
      // console.log("table.table")
      // console.log(table.table);
      const lineConfig = {
        table: table.table,
        valueFormatters: {
          _time: timeFormatter({
            timeFormat: "UTC",
            format: "YYYY-MM-DD HH:mm:ss ZZ",
          }),
          _value: (val) =>
            `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`,
        },
        xScale: "linear",
        yScale: "linear",
        legendFont: "12px sans-serif",
        tickFont: "10px sans-serif",
        showAxes: true,
        layers: [
          {
            type: "line",
            x: "_time",
            y: "_value",
            fill: [],
            position: "overlaid",
            interpolation: "monotoneX",
            colors: NINETEEN_EIGHTY_FOUR,
            lineWidth: 1,
            hoverDimension: "auto",
            shadeBelow: true,
            shadeBelowOpacity: 0.1,
          },
        ],
      };

     
      plotGraph = <Plot config={lineConfig} />;

      // plotGraph = <p>Fetched</p>;
      // scatterGraph = <p>Help</p>;
     
     
   
     
      break;
  }

  return (
    <>
      <h2 key="heading-1"> Månedesrapport </h2>
      <h3 key="heading-2">Temperatur</h3>
      <div
        style={{
          width: "calc(80vw - 20px)",
          height: "calc(70vh - 20px)",
          margin: "40px",
        }}
      >
        {plotGraph}
      </div>
   
    </>
  );
};