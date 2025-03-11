const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');

const BOT_TOKEN = '7689202878:AAFmAuvelPlcnDm39acAJNfUcfsqJtSvN_U';
const bot = new Telegraf(BOT_TOKEN);

// Start Command
bot.start((ctx) => {
    ctx.reply("👋 ඔබේ YouTube Downloader Bot එකට සාදරයෙන් පිළිගනිමු!\n\n🎥 Video එකක් බාගන්න:\n👉 YouTube Link එකක් යවන්න.");
});

// Handle YouTube URLs
bot.on('text', async (ctx) => {
    const url = ctx.message.text;

    if (!ytdl.validateURL(url)) {
        return ctx.reply("⚠️ කරුණාකර වලංගු YouTube Link එකක් ලබාදෙන්න!");
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails.pop().url;

    ctx.replyWithPhoto(thumbnail, {
        caption: `🎬 *${title}*\n\n📥 MP3 හෝ MP4 තෝරන්න:`,
        parse_mode: "Markdown",
        reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback("🎵 MP3 Download", `download_mp3_${url}`)],
            [Markup.button.callback("📹 MP4 Download", `download_mp4_${url}`)]
        ])
    });
});

// Handle MP3 Download
bot.action(/download_mp3_(.*)/, async (ctx) => {
    const url = ctx.match[1];

    ctx.reply("⏳ MP3 File එක Download කරමින්...");
    
    const stream = ytdl(url, { filter: 'audioonly' });
    const filePath = `download.mp3`;

    stream.pipe(fs.createWriteStream(filePath)).on('finish', () => {
        ctx.replyWithDocument({ source: filePath, filename: "audio.mp3" });
    });
});

// Handle MP4 Download
bot.action(/download_mp4_(.*)/, async (ctx) => {
    const url = ctx.match[1];

    ctx.reply("⏳ MP4 File එක Download කරමින්...");
    
    const stream = ytdl(url, { quality: 'highest' });
    const filePath = `download.mp4`;

    stream.pipe(fs.createWriteStream(filePath)).on('finish', () => {
        ctx.replyWithDocument({ source: filePath, filename: "video.mp4" });
    });
});

// Start the bot
bot.launch();
