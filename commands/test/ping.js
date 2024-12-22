module.exports = {
  name: "ping",
  description: "Respond with a pong!",
  admin: false,
  group: true,
  private: false,
  execute: async (msg, { args, bot }) => {
    return msg.reply("Pong!");
  },
};
