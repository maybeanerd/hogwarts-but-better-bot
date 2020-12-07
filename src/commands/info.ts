import { MessageEmbedOptions } from 'discord.js';
import { COLOR, user, SIGN } from '../shared_assets';

import { accessLevel } from '../types/enums';

export const inf: botCommand = {
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

    const embed: MessageEmbedOptions = {
      color: COLOR,
      description: 'Some information about the bot:',
      fields: info,
      footer: {
        iconURL: user().avatarURL() || '',
        text: SIGN,
      },
    };

    msg.channel.send({ embed });
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
  perm: 'SEND_MESSAGES',
  admin: false,
  hide: false,
  minAccessLevel: accessLevel.default,
};
