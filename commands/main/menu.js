module.exports = {
  name: "menu",
  description: "Show the command list.",
  execute: async (msg, { args, bot, usedPrefix }) => {
    let categorizedCommands = {};
    for (const [commandName, commandData] of bot.commands) {
      const category = commandData.category;
      if (!categorizedCommands[category]) {
        categorizedCommands[category] = [];
      }
      categorizedCommands[category].push({
        name: commandName,
        description: commandData.description,
      });
    }

    let menuText = "/// COMMAND LIST ///\n\nOwner: Acaa\n\n";
    for (const category in categorizedCommands) {
      menuText += `*${
        category.toString().charAt(0).toUpperCase() + category.slice(1)
      }*\n`;
      for (const command of categorizedCommands[category]) {
        menuText += `- \`\`\`${usedPrefix}${command.name}\`\`\`: ${command.description}\n`;
      }
      menuText += "\n";
    }
    return msg.reply(menuText);
  },
};
