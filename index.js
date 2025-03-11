const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7689202878:AAFmAuvelPlcnDm39acAJNfUcfsqJtSvN_U';
const YT_API_KEY = 'AIzaSyCMeUhsSIzwg33iPi5QFmB6F9Iy2Clp6GY';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply("👋 ඔබේ YouTube Downloader Bot එකට සාදරයෙන් පිළිගනිමු!\n\n🔍 Video එකක් ලබාගන්න:\n👉 `@yourbotname video name`\n\n📥 Download කරන්න Button එක Click කරන්න!", { parse_mode: 'Markdown' });
});

bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query;
    if (!query) return;

    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: query,
                key: YT_API_KEY,
                type: 'video',
                maxResults: 5,
            }
        });

        const results = response.data.items.map((video, index) => ({
            type: 'article',
            id: String(index),
            title: video.snippet.title,
            description: "Click to download",
            thumb_url: video.snippet.thumbnails.default.url,
            input_message_content: {
                message_text: `🎥 *${video.snippet.title}*\n🔗 [Watch Here](https://youtu.be/${video.id.videoId})\n\nClick below to download 👇`,
                parse_mode: 'Markdown',
            },
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "⬇️ Download MP4", callback_data: `mp4_${video.id.videoId}` },
                        { text: "🎵 Download MP3", callback_data: `mp3_${video.id.videoId}` }
                    ]
                ]
            }
        }));

        ctx.answerInlineQuery(results);
    } catch (error) {
        console.error(error);
    }
});

bot.action(/(mp3|mp4)_(\w+)/, async (ctx) => {
    const format = ctx.match[1];
    const videoId = ctx.match[2];
    
    const apiUrl = `https://someapi.com/download?format=${format}&videoId=${videoId}`;
    await ctx.reply(`🔄 Downloading ${format.toUpperCase()}...`);
    
    await ctx.replyWithDocument({ url: apiUrl });
});

bot.launch();
