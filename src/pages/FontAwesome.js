import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

const FontAwesomeSamples = () => (
  <div>
    <h1>FontAwesome Samples</h1>
    <FontAwesomeIcon icon={faCoffee} /> Coffee Icon
    {/* Additional FontAwesome icons can be added here */}
  </div>
);

export default FontAwesomeSamples;
