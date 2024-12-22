const axios = require("axios");

module.exports = {
  name: "anime",
  description: "Get anime information from Jikan API",
  group: false, // Bisa dijalankan di private chat atau grup
  private: false, // Bisa dijalankan di private chat atau grup
  execute: async (msg, { args, bot }) => {
    if (args.length === 0) {
      return msg.reply("Please provide the name of the anime!");
    }

    // Ambil nama anime dari argumen
    const animeName = args.join(" ");

    try {
      // Request data anime dari Jikan API
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          animeName
        )}&limit=1`
      );
      const anime = response.data.data[0]; // Ambil anime pertama dari hasil pencarian

      if (!anime) {
        return msg.reply("Sorry, I couldn't find any anime with that name.");
      }

      // Siapkan pesan yang akan dikirim
      const animeInfo = `
*Title*: ${anime.title}
*English Title*: ${anime.title_english || "N/A"}
*Japanese Title*: ${anime.title_japanese || "N/A"}
*Synopsis*: ${anime.synopsis || "No description available."}
*Rating*: ${anime.rating || "No rating"}
*Episodes*: ${anime.episodes || "Unknown"}
*Status*: ${anime.status}
*Aired*: ${anime.aired.string}
*Genres*: ${anime.genres.map((genre) => genre.name).join(", ") || "No genres"}

*Score*: ${anime.score || "No score"}
*Members*: ${anime.members || "No data"}
*Favorites*: ${anime.favorites || "No data"}

*Link*: ${anime.url}
      `;

      // Kirim gambar dan informasi
      await bot.sendMessage(msg.key.remoteJid, {
        text: animeInfo,
        caption: anime.title,
        image: { url: anime.images.jpg.image_url }, // Kirim gambar anime
      });
    } catch (error) {
      console.error(error);
      return msg.reply(
        "There was an error while fetching the anime information."
      );
    }
  },
};