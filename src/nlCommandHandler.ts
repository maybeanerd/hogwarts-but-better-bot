import Discord, { Message } from 'discord.js';
import { findMember } from './bamands';
import { transferredPoints } from './database/allModels';
import { updateStats } from './housePointTracker';
// eslint-disable-next-line import/no-cycle
import { catchErrorOnDiscord } from './sendToMyDiscord';
import { hogwartsHouses } from './shared_assets';
import { hogwartsHouse } from './types/enums';

function getPointGifs(house: hogwartsHouse, addition: boolean) {
  if (house === hogwartsHouse.Slytherin) {
    if (addition) {
      return 'https://media.discordapp.net/attachments/779119442184765492/781650549623881728/points_for_slytherin.gif';
    }
    return 'https://media.discordapp.net/attachments/779119442184765492/781650552261836810/points_from_slytherin.gif';
  }
  if (house === hogwartsHouse.Ravenclaw) {
    if (addition) {
      return 'https://media.discordapp.net/attachments/779119442184765492/781650553511084052/points_for_ravenclaw.gif';
    }
    return 'https://media.discordapp.net/attachments/779119442184765492/781650540748341278/points_from_ravenclaw.gif';
  }
  if (house === hogwartsHouse.Hufflepuff) {
    if (addition) {
      return 'https://media.discordapp.net/attachments/779119442184765492/781650546607128576/points_for_hufflepuff.gif';
    }
    return 'https://media.discordapp.net/attachments/779119442184765492/781650552261836810/points_from_slytherin.gif';
  }
  if (house === hogwartsHouse.Gryffindor) {
    if (addition) {
      return 'https://media.discordapp.net/attachments/779119442184765492/781650543759982602/points_for_gryffindor.gif';
    }
    return 'https://media.discordapp.net/attachments/779119442184765492/781650548784234527/points_from_hufflepuff.gif';
  }
  return null;
}

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
            url: getPointGifs(userHouse, addition) || '',
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
