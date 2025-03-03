import { createRoot } from "react-dom/client";
import { StrictMode } from "react"; // Import StrictMode
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
