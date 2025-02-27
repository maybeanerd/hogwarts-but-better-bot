import { EmbedBuilder, userMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  COLOR, user, SIGN, getCurrentSeason, getReadableHouseFromEnum, hogwartsHouses,
} from '../shared_assets';

import { accessLevel, hogwartsHouse } from '../types/enums';
import { BotCommand } from '../types/command';
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

    const seasonOfCommand = (content.split(' ')[0]);

    const season = seasonOfCommand ? Number(seasonOfCommand) : getCurrentSeason();

    if (Number.isNaN(season)) {
      await msg.reply(
        `Invalid season supplied:${seasonOfCommand}`,
      );
      return;
    }

    const pointsOfSeason = await transferredPoints.findAll({
      where: {
        season,
      },
    });

    const pointsOfUser = new Map<string, number>();
    const minusPointsOfUser = new Map<string, number>();
    const plusPointsOfUser = new Map<string, number>();
    const plusPointsOfGiver = new Map<string, number>();
    const minusPointsOfGiver = new Map<string, number>();
    const pointsOfHouse = new Map<hogwartsHouse, number>();

    hogwartsHouses.forEach((house) => {
      pointsOfHouse.set(house, 100);
    });

    pointsOfSeason.forEach((point) => {
      const {
        house, receiver_id: receiverId, amount, giver_id: giverId,
      } = point;
      pointsOfUser.set(receiverId, (pointsOfUser.get(receiverId) ?? 0) + amount);
      if (amount < 0) {
        minusPointsOfUser.set(receiverId, (minusPointsOfUser.get(receiverId) ?? 0) + amount);
        minusPointsOfGiver.set(giverId, (minusPointsOfGiver.get(giverId) ?? 0) + amount);
      } else {
        plusPointsOfUser.set(receiverId, (plusPointsOfUser.get(receiverId) ?? 0) + amount);
        plusPointsOfGiver.set(giverId, (plusPointsOfGiver.get(giverId) ?? 0) + amount);
      }

      pointsOfHouse.set(house, (pointsOfHouse.get(house) ?? 100) + amount);
    });

    const housePoints = Array.from(pointsOfHouse.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([house, points]) => `${getReadableHouseFromEnum(house)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Houses',
      value: housePoints,
      inline: false,
    });

    const maxStatEntries = 5;

    const userPoints = Array.from(pointsOfUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxStatEntries)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top Users by sum',
      value: userPoints,
      inline: false,
    });

    const userMinusPoints = Array.from(minusPointsOfUser.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, maxStatEntries)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top Users by lost points',
      value: userMinusPoints,
      inline: false,
    });

    const userPlusPoints = Array.from(plusPointsOfUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxStatEntries)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top Users by gained points',
      value: userPlusPoints,
      inline: false,
    });

    const giverMinusPoints = Array.from(minusPointsOfGiver.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, maxStatEntries)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top teachers by points taken',
      value: giverMinusPoints,
      inline: false,
    });

    const giverPlusPoints = Array.from(plusPointsOfGiver.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxStatEntries)
      .map(([userId, points]) => `${userMention(userId)}: ${points}`)
      .join('\n');

    info.push({
      name: 'Top teachers by points given',
      value: giverPlusPoints,
      inline: false,
    });

    const embed = new EmbedBuilder({
      color: COLOR,
      description: `Stats of season ${season}`,
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
