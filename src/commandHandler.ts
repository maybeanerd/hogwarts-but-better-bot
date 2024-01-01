import Discord from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { inf as info } from './commands/info';
import { ping } from './commands/ping';
// we allow this cycle once, as the help command also needs to list itself
import { help } from './commands/help'; // eslint-disable-line import/no-cycle
import { stats } from './commands/stats';

import {
  DELETE_COMMANDS, isAdmin, PREFIX, user,
} from './shared_assets';
// eslint-disable-next-line import/no-cycle
import { catchErrorOnDiscord } from './sendToMyDiscord';
import { accessLevel } from './types/enums';
// eslint-disable-next-line import/no-cycle
import { handle } from './naturalLanguageCommandHandler';
import { BotCommand } from './types/magibot';

export const commands: { [k: string]: BotCommand } = {
  help,
  info,
  ping,
  stats,
};

async function catchError(error: Error, msg: Discord.Message, command: string) {
  console.error(
    `Caught:\n${error.stack}\nin command ${command} ${msg.content}`,
  );
  await catchErrorOnDiscord(
    `**Command:** ${command} ${msg.content}\n**Caught Error:**\n\`\`\`${error.stack}\`\`\``,
  );

  msg.reply(`something went wrong while using ${command}. The devs have been automatically notified.
If you can reproduce this, consider using \`${PREFIX}.bug <bugreport>\` or join the support discord (link via \`${PREFIX}.info\`) to tell us exactly how.`);
}

const userCooldowns = new Set<string>();

export async function checkCommand(msg: Discord.Message) {
  if (!(msg.author && msg.guild && msg.guild.members.me)) {
    // check for valid message
    console.error('Invalid message received:', msg);
    return;
  }
  if (!(!msg.author.bot && msg.channel.type === ChannelType.GuildText)) {
    // check for in guild and text channel
    return;
  }
  let isMention: boolean;
  if (
    msg.content.startsWith(`<@${user().id}>`)
    || msg.content.startsWith(`<@!${user().id}>`)
  ) {
    isMention = true;
  } else if (msg.content.startsWith(PREFIX)) {
    isMention = false;
  } else {
    // here we can have "natural language" commands
    await handle(msg);
    return;
  }

  let command: string;
  let content: string;
  if (isMention) {
    command = msg.content.split(' ')[1]; // eslint-disable-line prefer-destructuring
    content = msg.content
      .split(' ')
      .splice(2, msg.content.split(' ').length)
      .join(' ');
    command = `.${command}`;
  } else {
    command = msg.content
      .substring(PREFIX.length, msg.content.length)
      .split(' ')[0]
      .toLowerCase();
    // delete prefix and command
    content = msg.content.slice(command.length + PREFIX.length);
    content = content.replace(/^\s+/g, ''); // delete leading spaces
  }
  if (command) {
    let commandVal: string;
    const pre = command.charAt(0);
    const myPerms = (msg.channel as Discord.TextChannel).permissionsFor(
      msg.guild.members.me,
    );
    if (pre === '.') {
      command = command.slice(1);
      commandVal = command;
    } else {
      return;
    }
    const cmd = commands[command];
    if (cmd && cmd.minAccessLevel === accessLevel.admin) {
      if (isAdmin(msg.member)) {
        if (myPerms) {
          if (myPerms.has(PermissionFlagsBits.ManageMessages)) {
            msg.delete();
          }
          if (myPerms.has(PermissionFlagsBits.SendMessages)) {
            msg
              .reply("you're not allowed to use this command.")
              .then((mess) => setTimeout(() => mess.delete(), 5000));
          }
        }
        return;
      }
    }
    if (cmd) {
      if (
        cmd // just check if user is allowed to use commands here
        /* || (await data.commandAllowed(msg.guild.id, msg.channel.id)) */
      ) {
        const perms = commands[command].perm;
        if (!perms || (myPerms && myPerms.has(perms))) {
          // cooldown for command usage
          if (!userCooldowns.has(msg.author.id)) {
            userCooldowns.add(msg.author.id);
            setTimeout(() => {
              userCooldowns.delete(msg.author.id);
            }, 4000);
            try {
              await commands[command].main(content, msg);
            } catch (err) {
              catchError(err as Error, msg, `${PREFIX}${pre}${commandVal}`);
            }
          } else if (myPerms && myPerms.has(PermissionFlagsBits.SendMessages)) {
            msg.reply("whoa cool down, you're using commands too quick!");
          }
          // endof cooldown management
        } else if (myPerms && myPerms.has(PermissionFlagsBits.SendMessages)) {
          msg.channel.send(
            `I don't have the permissions needed for this command. (${perms}) `,
          );
        }
      } else if (myPerms && myPerms.has(PermissionFlagsBits.SendMessages)) {
        if (myPerms && myPerms.has(PermissionFlagsBits.ManageMessages)) {
          msg.delete();
        }
        msg
          .reply(
            `commands aren't allowed in <#${msg.channel.id}>. Use them in ${
              /* await data.commandChannel(
              msg.guild.id,
            ) */ ''
            }. If you're an admin use \`${PREFIX}:help\` to see how you can change that.`,
          )
          .then((mess) => setTimeout(() => mess.delete(), 15000));
      }
    }
  }

  if (DELETE_COMMANDS) msg.delete();
}
