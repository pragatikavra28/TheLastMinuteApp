require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   PAYMENT SERVICE READY                       ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Service running on: http://localhost:${PORT}              ║
║  💳 Mock Payment Mode                                        ║
║  📊 Health: http://localhost:${PORT}/health                   ║
╚══════════════════════════════════════════════════════════════╝
  `);
});