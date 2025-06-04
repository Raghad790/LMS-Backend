import app from "./app.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV || "development";

// Start the server
const server = app.listen(PORT, () => {
    console.log(`✅ Server running in ${ENV} mode on port ${PORT}`);
});

// Gracefully handle shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});