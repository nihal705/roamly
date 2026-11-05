import "dotenv/config";
import app from "./app.js";
import { connectDatabase, resetDbIdleTimer } from "./config/db.js";
import { startBookingLifecycle } from "./jobs/lifecycle.js";

const port = process.env.PORT || 5000;
connectDatabase()
  .then(() => {
    startBookingLifecycle();
    resetDbIdleTimer();
    app.listen(port, () => console.log(`API running on :${port}`));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
