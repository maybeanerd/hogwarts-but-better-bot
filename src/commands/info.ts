import { EmbedBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { COLOR, user, SIGN } from '../shared_assets';

import { accessLevel } from '../types/enums';
import { BotCommand } from '../types/command';

export const inf: BotCommand = {
  dev: false,
  name: 'info',
  main: (content, msg) => {
    const info: Array<{
      name: string;
      value: string;
      inline: boolean;
    }> = [];

    info.push({
      name: 'How to support Development',
      value:
        'Donate a buck via [Paypal](https://paypal.me/pools/c/8be5ok31vB)\nPledge on [MagiBots Patreon](https://www.patreon.com/MagiBot)',
      inline: false,
    });

    info.push({
      name: 'A bit of background',
      value: 'Hausbot is a bot for Hogwarts, but better.',
      inline: false,
    });

    const embed = new EmbedBuilder({
      color: COLOR,
      description: 'Some information about the bot:',
      fields: info,
      footer: {
        icon_url: user().avatarURL() || '',
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
          'Get some info about the bot as well as links to official Hausbot stuff.',
      },
    ];
  },
  perm: PermissionFlagsBits.SendMessages,
  admin: false,
  hide: false,
  minAccessLevel: accessLevel.default,
};
