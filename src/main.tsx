import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import "./styles/style.css";
import "./styles/typography.css";

import App from "./components/app";
import { SimulationContextProvider } from "./components/simulation-context";

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <SimulationContextProvider>
        <App />
      </SimulationContextProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
