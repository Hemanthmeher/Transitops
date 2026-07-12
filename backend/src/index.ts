import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`🚛 TransitOps API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health`);
});
