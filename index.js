async function main() {
    const { Telegraf, Markup } = require("telegraf");
    const { getDetails } = require("./api");
    const { sendFile } = require("./utils");
    const express = require("express");

    const bot = new Telegraf(process.env.BOT_TOKEN);

    // Function to check if the user is subscribed to a channel
    async function isSubscribed(ctx, channelUsername) {
        try {
            const chatMember = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
            const status = chatMember.status;
            // Return true if the user is a member, administrator, or creator
            return status === 'member' || status === 'administrator' || status === 'creator';
        } catch (e) {
            console.error('Error checking subscription:', e);
            return false;
        }
    }

    bot.start(async (ctx) => {
        try {
            ctx.reply(
                `Hi ${ctx.message.from.first_name},\n\nI can Download Files from Terabox.\n\nMade with ❤️ by @botcodes123\n\nSend any terabox link to download.`,
                Markup.inlineKeyboard([
                    Markup.button.url(" Channel", "https://t.me/botcodes123"),
                    Markup.button.url("Report bug", "https://t.me/Armanidrisi_bot"),
                ]),
            );
        } catch (e) {
            console.error(e);
        }
    });

    // Force subscribe command handler
    bot.command('forcesubscribe', async (ctx) => {
        const channelUsername = '@Film_Nest'; // The target channel username

        try {
            const isUserSubscribed = await isSubscribed(ctx, channelUsername);

            if (isUserSubscribed) {
                ctx.reply("You're already subscribed to the channel.");
            } else {
                ctx.reply(
                    "Please subscribe to our channel @Film_Nest to use this bot.",
                    Markup.inlineKeyboard([
                        Markup.button.url("Join Channel", `https://t.me/${channelUsername}`)
                    ])
                );
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
            ctx.reply('Oops! Something went wrong. Please try again later.');
        }
    });

    bot.on("message", async (ctx) => {
        if (ctx.message && ctx.message.text) {
            const messageText = ctx.message.text;
            if (
                messageText.includes("terabox.com") ||
                messageText.includes("teraboxapp.com")
            ) {
                const details = await getDetails(messageText);
                if (details && details.direct_link) {
                    try {
                        ctx.reply(`Sending Files Please Wait.!!`);
                        sendFile(details.direct_link, ctx);
                    } catch (e) {
                        console.error(e); // Log the error for debugging
                        ctx.reply('Something went wrong while sending the file.');
                    }
                } else {
                    ctx.reply('Something went wrong while fetching the file details.');
                }
                console.log(details);
            } else {
                ctx.reply("Please send a valid Terabox link.");
            }
        }
    });

    const app = express();
    // Set the bot API endpoint
    app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

    app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
