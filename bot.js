require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('Web server running'));

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function postDailyPoll() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) return;

    await channel.send({
      content: '@everyone Lock in ^',
      allowedMentions: { parse: ['everyone'] },
      poll: {
        question: { text: 'How did you execute today?' },
        answers: [
          { text: 'Win', emoji: { name: '✅' } },
          { text: 'Loss', emoji: { name: '❌' } },
          { text: 'Breakeven', emoji: { name: '➖' } },
          { text: 'No trade', emoji: { name: '🚫' } },
        ],
        duration: 24,
        allowMultiselect: false,
      },
    });

    console.log('Poll sent');
  } catch (err) {
    console.error(err);
  }
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);

  cron.schedule(
    '0 17 * * 1-5',
    async () => {
      await postDailyPoll();
    },
    {
      timezone: 'America/New_York',
    }
  );

  console.log('Scheduler running');
});

client.login(TOKEN);