const Serializer = require("../lib/Serializer");

module.exports = {
  async chatUpdate(messages) {
    try {
      const msg = Serializer.serializeMessage(this, messages.messages[0]);
      if (!msg || !msg.message) return;
      if (msg.key.fromMe) return;

      console.log(JSON.stringify(msg, null, 2));

      // Command handling
      const botPrefix = /^!/;

      let usedPrefix = msg.text?.match(botPrefix)?.[0];
      if (!usedPrefix) return; // If no prefix is found, exit

      const args = msg.text.slice(usedPrefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      if (!this.commands || typeof this.commands.has !== "function") {
        console.error("Commands map is invalid or not initialized!");
        return;
      }

      if (!this.commands.has(commandName)) {
        return msg.reply(
          `Unknown command: ${commandName}\n... maybe try see ${usedPrefix}menu for check some commands list?`
        );
      }

      const command = this.commands.get(commandName);

      // Check group permissions
      let groupMetadata = msg.isGroup ? await this.groupMetadata(msg.from) : {};
      let participants = msg.isGroup ? groupMetadata.participants : [];
      let user = msg.isGroup
        ? participants.find((u) => u.id == msg.author)
        : {};
      let bot = msg.isGroup
        ? participants.find((u) => u.id == Serializer.decodeJid(this.user.id))
        : {};

      let isAdmin = msg.isGroup
        ? user?.admin == "admin" || user?.admin == "superadmin"
        : false;
      let isBotAdmin = msg.isGroup ? bot?.admin : false;

      if (command.admin && !isAdmin) {
        return msg
          .react("⚠️")
          .then(() =>
            msg.reply("This command can only executed by the admin!")
          );
      } else if (command.botAdmin && !isBotAdmin) {
        return msg
          .react("⚠️")
          .then(() =>
            msg.reply(
              "Make sure the bot is admin before executing this command!"
            )
          );
      } else if (msg.isGroup && command.private) {
        return msg
          .react("⚠️")
          .then(() =>
            msg.reply("This command can only executed in private chat!")
          );
      } else if (!msg.isGroup && command.group) {
        return msg
          .react("⚠️")
          .then(() =>
            msg.reply("This command can only executed in group chat!")
          );
      }

      // Execute the command
      command.execute(msg, {
        args,
        bot: this,
        usedPrefix,
      });
    } catch (error) {
      console.error("Error in chatUpdate handler:", error);
      this.sendMessage(
        messages.key?.remoteJid,
        {
          text: "There's some error while executing the command, please contact the owner to resolve this problem!",
        },
        { quoted: messages }
      );
    }
  },
};
