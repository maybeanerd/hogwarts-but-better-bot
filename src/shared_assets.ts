import { ClientUser } from 'discord.js';

export const PREFIX = 'something';
export const { TOKEN } = process.env;
export const DETAILED_LOGGING = false;
export const DELETE_COMMANDS = false;
export const COLOR = 0x351c75;
export const SUCCESS_COLOR = 0x00ff00;
export const ERROR_COLOR = 0x0000ff;
export const INFO_COLOR = 0x0000ff;
export const SIGN = 'Hausbot - created by T0TProduction#0001 and h31nd5#0315';

let bot_user: ClientUser;
export function setUser(usr: ClientUser) {
  bot_user = usr;
}
export function user() {
  return bot_user;
}
