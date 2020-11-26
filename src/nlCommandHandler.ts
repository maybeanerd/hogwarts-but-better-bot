import Discord, { Message } from 'discord.js';
import { findMember } from './bamands';
import { transferredPoints } from './database/allModels';
import { updateStats } from './housePointTracker';
// eslint-disable-next-line import/no-cycle
import { catchErrorOnDiscord } from './sendToMyDiscord';
import { hogwartsHouses } from './shared_assets';
import { hogwartsHouse } from './types/enums';

async function getHouseOfUser(member: Discord.GuildMember) {
  if (!member) {
    return null;
  }
  const role = member.roles.cache.find((r) => hogwartsHouses.has(r.name.toLowerCase()));
  if (!role) {
    return null;
  }
  return hogwartsHouses.get(role.name.toLowerCase()) || null;
}

export async function handle(msg: Message) {
  try {
    const args = msg.content.split(' ').filter((arg) => arg !== '');
    if (args.length < 4 || args[1].toLowerCase() !== 'punkte') {
      return null;
    }
    const amount = Number(args[0]);
    if (!amount) {
      return msg.reply('invalid amount.');
    }
    if (amount % 10 !== 0) {
      return msg.reply(
        'Invalid amount of points supplied, only multiples of 10 allowed.',
      );
    }
    const addition: boolean = args[2].toLowerCase() === 'für';
    if (!addition) {
      if (
        !(args[2].toLowerCase() === 'abzug' && args[3].toLowerCase() === 'für')
      ) {
        return msg.reply('I cant tell what youre trying to do tbh.');
      }
    }
    const mentionedUser = addition ? args[3] : args[4];
    const { user, error } = await findMember(msg.guild!, mentionedUser);

    if (error) {
      return msg.reply(`Found no user of that name, bruh.\n${error}`);
    }
    const userHouse = await getHouseOfUser(user!);
    if (!userHouse) {
      return msg.reply(`${user!.displayName} doesn't seem to have a house.`);
    }

    // do something with our info
    await transferredPoints.upsert({
      giver_id: msg.member!.id,
      receiver_id: user!.id,
      amount: addition ? amount : amount * -1,
      date: new Date(),
      house: userHouse,
      season: 1,
    });
    updateStats();
    return msg.channel.send(
      `${amount} Punkte ${!addition ? 'Abzug ' : ''}für ${
        hogwartsHouse[userHouse]
      }!`,
      {
        embed: {
          image: {
            url:
              'https://media.discordapp.net/attachments/779119442184765492/781642723710730280/711ef52d26e1acd56de0969455708af5eab48245_hq.gif',
          },
        },
      },
    );
  } catch (e) {
    await catchErrorOnDiscord(
      `Tried to read command from natural language and failed:\n\`\`\`${e}\`\`\``,
    );
    return msg.reply(
      'I thought this was a command, but something went wrong. The developers have been notified of this.',
    );
  }
}
