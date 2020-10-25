import Discord, { Message } from 'discord.js';
import { accessLevel } from './enums';

declare global {
  type botCommand = {
    name: string;
    ehelp: (msg: Message) => Array<{ name: string; value: string }>;
    admin: boolean;
    hide: boolean;
    dev: boolean;
    perm: Discord.PermissionResolvable | Discord.PermissionResolvable[];
    minAccessLevel: accessLevel;
    main:
      | ((content: string, msg: Discord.Message) => Promise<any>)
      | ((content: string, msg: Discord.Message) => any);
  };
}
