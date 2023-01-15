import { config } from 'dotenv';

config();

/* eslint-disable import/first */
import Discord, {
  ActivityType, ChannelType, DiscordAPIError, GatewayIntentBits,
} from 'discord.js';
import Umzug from 'umzug';
import { Sequelize } from 'sequelize';
import { sequelize } from './database/allModels';
import {
  TOKEN, setUser, productionMode, channelIDs,
} from './shared_assets';
// eslint-disable-next-line import/no-cycle
import { checkCommand } from './commandHandler';
// eslint-disable-next-line import/no-cycle
import { catchErrorOnDiscord } from './sendToMyDiscord';
import { trackAndCreateMessage } from './housePointTracker';
/* eslint-enable import/first */

const umzug = new Umzug({
  storage: 'sequelize',
  storageOptions: {
    sequelize, // here should be a sequelize instance, not the Sequelize module
  },
  migrations: {
    params: [
      sequelize.getQueryInterface(),
      Sequelize, // Sequelize constructor - the required module
    ],
    path: './src/migrations',
    pattern: /\.js$/,
  },
});

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildIntegrations, // prob not needed ATM
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions, // prob not needed ATM
];

export const bot = new Discord.Client({ intents });

process.on('uncaughtException', async (err) => {
  console.error(`Uncaught Exception:\n${err.stack ? err.stack : err}`);
  await catchErrorOnDiscord(
    `**Uncaught Exception:**\n\`\`\`${err.stack ? err.stack : err}\`\`\``,
  );
});
process.on('unhandledRejection', async (
  err: any, /* to fix weird type issues */
) => {
  console.error(`Unhandled promise rejection:\n${err}`);
  if (err) {
    if (err instanceof DiscordAPIError) {
      await catchErrorOnDiscord(
        `**DiscordAPIError (${err.message || 'NONE'}):**\n\`\`\`${
          err.message
        }\`\`\`\`\`\`${err.stack ? err.stack.substring(0, 1200) : ''}\`\`\``,
      );
    } else {
      await catchErrorOnDiscord(
        `**Outer Unhandled promise rejection:**\n\`\`\`${err}\`\`\`\`\`\`${
          err.stack ? err.stack.substring(0, 1200) : ''
        }\`\`\``,
      );
    }
  }
});

// fires on startup and on reconnect
let justStartedUp = true;
bot.on('ready', async () => {
  try {
    console.info('[UMZUG] Applying pending migrations.');
    const migrations = await umzug.up();
    if (migrations.length > 0) {
      console.info('[UMZUG] Applied migrations:');
      /* eslint-disable no-restricted-syntax */
      for (const m of migrations) {
        console.info(` -  ${m.file}`);
      }
      /* eslint-enable no-restricted-syntax */
    } else {
      console.info('[UMZUG] Database is up to date.');
    }
  } catch (e) {
    console.error('[UMZUG] Failed migrating database:');
    console.error(e);
    process.exit();
  }

  const syncSequelizeModels = true;
  if (syncSequelizeModels) {
    console.info(
      '[SEQUELIZE] Starting to sync defined tables to DB because we are in dev mode.',
    );
    const wipeDB = false; // set to true if you changed the DB and are in dev mode
    // sync force apparently also wipes the SequelizeMeta table,
    // which then errors on re-trying migrations
    await sequelize.sync({
      force: wipeDB && !productionMode,
    });
    console.info('[SEQUELIZE] Finished syncing defined tables to DB.');
  }

  if (!bot.user) {
    throw new Error('FATAL Bot has no user.');
  }
  setUser(bot.user); // give user ID to other code
  const chann = await bot.channels.fetch(channelIDs.errorchannel);
  if (!chann || chann.type !== ChannelType.GuildText) {
    console.error('Teabots Server Channel not found.');
  }
  if (justStartedUp) {
    (chann as Discord.TextChannel).send('Hello there, i`m back!');
    justStartedUp = false;
  } else {
    (chann as Discord.TextChannel).send('Just reconnected to Discord...');
  }
  await bot.user.setPresence({
    activities: [
      {
        name: 'the students',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });

  trackAndCreateMessage(bot);
});

bot.on('messageCreate', async (msg) => {
  console.log('Message received: ', msg.content);
  try {
    await checkCommand(msg as Discord.Message);
  } catch (err) {
    console.error(err);
  }
});

bot.on('error', (err) => {
  console.error(err);
});

bot.on('disconnect', () => {
  console.info('Disconnected!');
});

bot.login(TOKEN); // connect to discord
