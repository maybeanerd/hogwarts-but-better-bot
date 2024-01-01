import { EmbedBuilder, userMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { COLOR, user, SIGN } from '../shared_assets';

import { accessLevel, hogwartsHouse } from '../types/enums';
import { BotCommand } from '../types/magibot';
import { transferredPoints } from '../database/allModels';

export const stats: BotCommand = {
  dev: false,
  name: 'stats',
  main: async (content, msg) => {
    const info: Array<{
      name: string;
      value: string;
      inline: boolean;
    }> = [];

    const year = 2023;

    const pointsOfSeason = await transferredPoints.findAll({
      where: {
        season: year,
      },
    });

    const pointsOfUser = new Map<string, number>();
    const pointsOfHouse = new Map<hogwartsHouse, number>();

    pointsOfSeason.forEach((point) => {
      const { house, receiver_id: receiverId, amount } = point;
      pointsOfUser.set(receiverId, (pointsOfUser.get(receiverId) ?? 0) + amount);
      pointsOfHouse.set(house, (pointsOfHouse.get(house) ?? 0) + amount);
    });

    const housePoints = Array.from(pointsOfHouse.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([house, points]) => `${house}: ${points}`)
      .join('\n');

    info.push({
      name: 'Houses',
      value: housePoints,
      inline: false,
    });

    const userPoints = Array.from(pointsOfUser.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top Users',
      value: userPoints,
      inline: false,
    });

    const embed = new EmbedBuilder({
      color: COLOR,
      description: `Da Stats of ${year}`,
      fields: info,
      footer: {
        icon_url: user().avatarURL() ?? '',
        text: SIGN,
      },
    });

    msg.channel.send({ embeds: [embed] });
  },
  ehelp() {
    return [
      {
        name: '',
        value:
          'Get detailed stats.',
      },
    ];
  },
  perm: PermissionFlagsBits.SendMessages,
  admin: false,
  hide: false,
  minAccessLevel: accessLevel.default,
};
