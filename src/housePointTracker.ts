import Discord from 'discord.js';
import { Sequelize } from 'sequelize';
import { transferredPoints } from './database/allModels';
import { channelIDs, currentSeason, hogwartsHouses } from './shared_assets';
import { hogwartsHouse } from './types/enums';

let msg: Discord.Message | null;

export async function updateStats() {
  const amounts: Array<{
    house: hogwartsHouse;
    points: number;
  }> = (await transferredPoints.findAll({
    attributes: [
      'house',
      'season',
      [Sequelize.fn('sum', Sequelize.col('amount')), 'points'],
    ],
    where: { season: currentSeason },
    group: ['house'],
    raw: true,
  })) as any;
  hogwartsHouses.forEach((h) => {
    if (!amounts.find((entry) => entry.house === h)) {
      amounts.push({ house: h, points: 0 });
    }
  });
  const fields: Array<Discord.EmbedFieldData> = amounts
    .sort((a, b) => b.points - a.points)
    .map((entry) => ({
      name: hogwartsHouse[entry.house],
      value: Math.max(0, Number(entry.points) + 100),
    }));

  if (msg !== null) {
    msg = await msg.edit({
      embed: {
        title: `Current house points (Season ${currentSeason})`,
        fields,
        image: {
          url:
            'https://media.discordapp.net/attachments/779119442184765492/781635288551391242/1000.png',
        },
      },
    });
  }
}

export async function trackAndCreateMessage(bot: Discord.Client) {
  const chann: Discord.TextChannel = (await bot.channels.fetch(
    channelIDs.pointtracker,
  )) as any;
  const messages = await chann.messages.fetch();
  const lastMessageByBot = messages.find((m) => m.author.id === bot.user!.id);

  if (lastMessageByBot) {
    msg = lastMessageByBot;
  } else {
    msg = await chann.send({
      embed: {
        title: 'Calculating current house points...',
        image: {
          url:
            'https://media.discordapp.net/attachments/779119442184765492/781635288551391242/1000.png',
        },
      },
    });
  }
  await updateStats();
}
