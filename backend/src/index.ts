import app from './app';
import { config } from './config';

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`
  ╔══════════════════════════════════════════╗
  ║          TransitOps API Server           ║
  ║──────────────────────────────────────────║
  ║  Port:    ${config.port.toString().padEnd(35)}║
  ║  Status:  Running${' '.repeat(28)}║
  ║  Mode:    ${config.nodeEnv.padEnd(35)}║
  ╚══════════════════════════════════════════╝
      `);
      console.log(`📡 API: http://localhost:${config.port}/api`);
      console.log(`❤️  Health: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
