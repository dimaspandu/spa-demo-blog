import Spa from "./spa/index.js";

const app = new Spa({
  hostdom: document.getElementById("host")
});

export { app };

export default app;