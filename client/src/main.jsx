// Client entry: mounts React app and enables routing.
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { enablePrototypeStorage } from "./utils/prototypeStorage";

enablePrototypeStorage();

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default App;
