const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const Pino = require("pino");
const NodeCache = require("node-cache");

const msgRetryCounterCache = new NodeCache();

async function connect(sessionDir) {
  // Client configuration
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  // Deploy the client
  const client = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" })),
    },
    msgRetryCounterCache,
    getMessage: () => {
      return proto.Message.fromObject(); // TODO: Create your own messagestore
    },
    logger: Pino({ level: "silent" }),
  });

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      console.log("connection closed");
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        console.log("Reconnecting...");
        await reconnect(sessionDir); // Pastikan sessionDir diteruskan
      } else {
        console.log("Connection closed. You are logged out.");
      }
    }

    console.log("connection update", update);
  });

  client.ev.on(
    "messages.upsert",
    require("../events/CommandHandler").chatUpdate.bind(client)
  );

  client.ev.on("creds.update", async () => {
    await saveCreds();
  });

  return client;
}

async function reconnect(sessionDir) {
  try {
    console.log("Attempting to reconnect...");
    await connect(sessionDir);
  } catch (error) {
    console.error("Reconnection failed:", error);
    setTimeout(() => reconnect(sessionDir), 5000); // Retry setelah 5 detik
  }
}

module.exports = { connect };
