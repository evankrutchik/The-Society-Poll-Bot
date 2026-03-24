require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('The Society Poll Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const TOKEN = process.env.BOT_TOKEN?.trim();
const CHANNEL_ID = process.env.CHANNEL_ID?.trim();

if (!TOKEN || !CHANNEL_ID) {
  console.error('Missing BOT_TOKEN or CHANNEL_ID');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function postDailyPoll() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.error('Channel not found or not text-based.');
      return;
    }

    await channel.send({
      content: '@everyone Lock in',
      allowedMentions: { parse: ['everyone'] },
      poll: {
        question: { text: 'How did you execute today?' },
        answers: [
          { text: 'Win', emoji: { name: '✅' } },
          { text: 'Loss', emoji: { name: '❌' } },
          { text: 'Breakeven', emoji: { name: '➖' } },
          { text: 'No trade', emoji: { name: '🚫' } }
        ],
        duration: 24,
        allowMultiselect: false
      }
    });

    console.log(`Poll posted successfully at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Failed to post poll:', error);
  }
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);

  cron.schedule(
    '0 17 * * 1-5',
    async () => {
      await postDailyPoll();
    },
    { timezone: 'America/New_York' }
  );

  console.log('Scheduler running: weekdays at 5:00 PM ET');
});

client.login(TOKEN);