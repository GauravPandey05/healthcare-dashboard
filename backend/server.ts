// src/backend/server.ts
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

// Connect to database
connectDB();

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});