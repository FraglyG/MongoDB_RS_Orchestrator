import { config } from "dotenv";
import { Db, MongoClient, MongoDBNamespace } from "mongodb";

export type DatabasePingResponse = {
    ok: number;
    operationTime: string;
    clusterTime: string
}

export class Orchestrator {
    replicaSetUrl: string;
    client: MongoClient;
    admin: Db;

    constructor(replicaSetUrl: string) {
        this.replicaSetUrl = replicaSetUrl;
        this.client = new MongoClient(this.replicaSetUrl, {});
        this.admin = this.client.db("admin");
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.close();
    }

    async startReplicaSet() {
        /** Ensure */
    }

    /** Fetch an array of MongoDB service urls from the replica-set url */
    fetchMongoUrls() {
        const urlSectors = this.replicaSetUrl.split("@");
        const preAuth = urlSectors[0];
        const postAuth = urlSectors[1];

        // extract auth from preAuth
        const auth = preAuth.match(/(\-|\_|\d|\w)+:(\-|\_|\d|\w)+/)?.[0];

        // extract hosts from postAuth
        const hosts = postAuth.match(/(\-|\_|\d|\w|\.)+:\d+/g) || [];
        const urls = hosts.map((host) => auth ? `mongodb://${auth}@${host}` : `mongodb://${host}`);
        return urls;
    }

    /** Check the health of a certain MongoDB service */
    async checkHealth(url: string) {
        // connect to the db from url and send ping command
        let client: MongoClient | null = null;
        try {
            client = await MongoClient.connect(url, { connectTimeoutMS: 3000, serverSelectionTimeoutMS: 3000 });
            const db = client.db("admin");
            const ping = await db.command({ ping: 1 });
            return ping;
        } catch (error) {
            console.warn(`Error pinging ${url}: ${(error as any).message || 'Unknown Error'}`);
            return { ok: 0, operationTime: "", clusterTime: "" };
        } finally {
            if (client) await client.close();
        }
    }

    /** Tests the health of all the MongoDB services */
    async checkHealthAll() {
        const urls = this.fetchMongoUrls();
        const pings = await Promise.all(urls.map((url) => this.checkHealth(url)));
        return pings;
    }
}