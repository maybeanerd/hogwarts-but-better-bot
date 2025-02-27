import Discord from 'discord.js';
import { accessLevel } from './enums';

export type HandledMessage = Discord.OmitPartialGroupDMChannel<Discord.Message<boolean>>;

export type BotCommand = {
  name: string;
  ehelp: (
    msg: HandledMessage
  ) => Array<{ name: string; value: string }>;
  admin: boolean;
  hide: boolean;
  dev: boolean;
  perm: Discord.PermissionResolvable | Discord.PermissionResolvable[];
  minAccessLevel: accessLevel;
  main:
    | ((content: string, msg: HandledMessage)
     => Promise<any>)
    | ((content: string, msg: HandledMessage)
     => any);
};
