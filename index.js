const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
const Canvas = require('canvas');



config({
    path: __dirname + "/.env"
})

// Declares our bot,
// the disableEveryone prevents the client to ping @everyone
const client = new Client({
    disableEveryone: true
});

// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "Forever !",
            type: "17ZV"
        }
    });

})

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    if (!message.member) {
        return;
    }

    const prefix = "zv!";
    const uid = message.member.id;

    // If the author's a bot, return
    // If the message was not sent in a server, return
    // If the message doesn't start with the prefix, return
    if (message.author.bot) return;
    if (!message.guild) return;

    // Arguments and command variable
    // cmd is the first word in the message, aka the command
    // args is an array of words after the command
    // !say hello I am a bot
    // cmd == say (because the prefix is sliced off)
    // args == ["hello", "I", "am", "a", "bot"]
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = (args.shift()).toLowerCase();


    switch (cmd) {

        case 'logo':

            const canvas = Canvas.loadImage('./ZV.png')
            const ctx = canvas.getContext('2d');

            ctx.font = "bold 15px Arial";
            ctx.fillStyle = "#fffffff9";
            ctx.fillText("LEVEL", 410, 78);

            const attachment = new Attachment(canvas.toBuffer(), `ZV.png`);
            message.channel.send(attachment);
            break;

        default:
            break;


    }
});