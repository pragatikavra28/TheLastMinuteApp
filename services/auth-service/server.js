require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    AUTH SERVICE READY                        ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Service running on: http://localhost:${PORT}              ║
║  📊 Health check: http://localhost:${PORT}/health             ║
║  🔐 Login: POST http://localhost:${PORT}/login                ║
║  📝 Register: POST http://localhost:${PORT}/register          ║
║  👤 Get profile: GET http://localhost:${PORT}/me              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});