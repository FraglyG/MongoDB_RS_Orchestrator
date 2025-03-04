import "dotenv/config";

export const config = {
    mongo_url: process.env.MONGO_REPLICA_SET_URL,
    port: process.env.PORT || 3000,
}