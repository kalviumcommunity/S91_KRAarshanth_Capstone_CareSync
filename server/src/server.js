import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`IHROS API running on http://localhost:${port}`)))
  .catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
