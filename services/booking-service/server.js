require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`🚀 Booking service running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});