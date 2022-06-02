import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactHashRouter, IonReactRouter } from "@ionic/react-router";
import { ellipse, triangle } from "ionicons/icons";
import Map from "./pages/Map";
import AnnotationsPage from "./pages/Annotations";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "mapbox-gl/dist/mapbox-gl.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonReactHashRouter>
          <Route exact path="/map">
            <Map />
          </Route>
          <Route exact path="/annotations">
            <AnnotationsPage />
          </Route>
          <Route exact path="/">
            <Redirect to="/map" />
          </Route>
        </IonReactHashRouter>
        <IonTabBar slot="bottom">
          <IonTabButton tab="Map" href="/map">
            <IonIcon icon={triangle} />
            <IonLabel>Map</IonLabel>
          </IonTabButton>
          <IonTabButton tab="Annotations" href="/annotations">
            <IonIcon icon={ellipse} />
            <IonLabel>Annotations</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
