require('dotenv').config(({path: './src/config/.env'}));  // Load env variables from .env file
const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})

server.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});