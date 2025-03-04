import { config } from "./config";
import { Orchestrator } from "./mongo";

if (!config.mongo_url) throw new Error("MONGO_REPLICA_SET_URL is not set in environment variables");

const orchestrator = new Orchestrator(config.mongo_url);

async function start() {
    console.log("Connecting...");
    // await orchestrator.connect();

    console.log("Fetching URLs...");
    const urls = orchestrator.fetchMongoUrls();
    console.log(urls);

    const firstURL = urls[0];

    console.log(`Pinging db ${firstURL}...`);
    const ping = await orchestrator.checkHealth(firstURL);
    console.log(ping);

    // await orchestrator.disconnect();
}

console.log("Starting...");
start();