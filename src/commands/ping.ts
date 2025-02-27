import { PermissionFlagsBits } from 'discord-api-types/v10';
import { accessLevel } from '../types/enums';
import { BotCommand } from '../types/command';

export const ping: BotCommand = {
  name: 'ping',
  dev: false,
  hide: false,
  main(bot, msg) {
    const start = Date.now();
    msg.channel.send('Pong!').then((newMsg) => {
      const stop = Date.now();
      const diff = stop - start;
      newMsg.edit(`Pong! \nReactiontime: \`(${diff}ms)\``);
    });
  },
  ehelp() {
    return [{ name: '', value: 'Ping the bot and get the response time.' }];
  },
  perm: PermissionFlagsBits.SendMessages,
  admin: false,
  minAccessLevel: accessLevel.default,
};
