import Discord, { Message } from 'discord.js';
import { findMember } from './bamands';
// eslint-disable-next-line import/no-cycle
import { bot } from './bot';
import { transferredPoints } from './database/allModels';
import { updateStats } from './housePointTracker';
// eslint-disable-next-line import/no-cycle
import { catchErrorOnDiscord } from './sendToMyDiscord';
import {
  channelIDs,
  currentSeason,
  hogwartsHouses,
  isAdmin,
} from './shared_assets';
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
    return 'https://media.discordapp.net/attachments/779119442184765492/781650548784234527/points_from_hufflepuff.gif';
  }
  if (house === hogwartsHouse.Gryffindor) {
    if (addition) {
      return 'https://media.discordapp.net/attachments/779119442184765492/781650543759982602/points_for_gryffindor.gif';
    }
    return 'https://media.discordapp.net/attachments/779119442184765492/781650545685168208/points_from_gryffindor.gif';
  }
  return null;
}

const bastisID = '185865492576075776';
const memeUrl = 'https://cdn.discordapp.com/attachments/779119442184765492/785545402882850826/bastiIsTheSenate.png';
/** Nach Lukas Wunsch ein kleines easteregg */
async function isBastiTheSenate(msg: Discord.Message) {
  const lowercaseMsg = msg.content.toLowerCase();
  if (
    msg.author.id === bastisID
    && lowercaseMsg.includes('senate')
    && lowercaseMsg.includes('the')
  ) {
    await msg.channel.send({
      content: 'Did you ask for the senate?',
      embeds: [
        {
          image: {
            url: memeUrl,
          },
        },
      ],
    });
    return true;
  }
  return false;
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
    if (await isBastiTheSenate(msg)) {
      return null;
    }
    const args = msg.content.split(' ').filter((arg) => arg !== '');
    if (
      args.length < 4
      || args.length > 5
      || args[1].toLowerCase() !== 'punkte'
    ) {
      return null;
    }

    if (!isAdmin(msg.member)) {
      return msg.reply('students are not allowed to do this.');
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
    const addition: boolean = args[2].toLowerCase() === 'für' || args[2].toLowerCase() === 'an';
    if (!addition) {
      if (
        !(
          args[2].toLowerCase() === 'abzug'
          && (args[3].toLowerCase() === 'für' || args[3].toLowerCase() === 'von')
        )
      ) {
        return msg.reply('I cant tell what youre trying to do tbh.');
      }
    }
    const mentionedUser = addition ? args[3] : args[4];
    let mentionedHouse = hogwartsHouses.get(mentionedUser.toLowerCase());
    let pointReceiver: Discord.GuildMember;
    if (mentionedHouse) {
      pointReceiver = msg.member!;
    } else {
      const { user, error } = await findMember(msg.guild!, mentionedUser);

      if (error) {
        return msg.reply(`Found no user of that name, bruh.\n${error}`);
      }
      if (isAdmin(user)) {
        return msg.reply(
          'You could give anyone points. Anyone. And you try this. *disgraceful.*',
        );
      }

      const userHouse = await getHouseOfUser(user!);
      if (!userHouse) {
        return msg.reply(`${user!.displayName} doesn't seem to have a house.`);
      }
      mentionedHouse = userHouse;
      pointReceiver = user!;
    }

    await transferredPoints.upsert({
      giver_id: msg.member!.id,
      // if we have no user and get here, the author gave a house points
      receiver_id: pointReceiver!.id,
      amount: addition ? amount : amount * -1,
      date: new Date(),
      house: mentionedHouse,
      season: currentSeason,
    });
    updateStats();
    await msg.channel.send({
      content: `${amount} Punkte ${!addition ? 'Abzug von' : 'für'} ${
        hogwartsHouse[mentionedHouse]
      }!`,
      embeds: [
        {
          image: {
            url: getPointGifs(mentionedHouse, addition) || '',
          },
        },
      ],
    });
    const chann: Discord.TextChannel = (await bot.channels.fetch(
      channelIDs.logchannel,
    )) as any;
    return chann.send(
      `[LOG] : \`${amount} Punkte ${!addition ? 'Abzug von' : 'für'} ${
        pointReceiver.id !== msg.author.id
          ? `${pointReceiver.displayName} vom Haus `
          : ''
      }${hogwartsHouse[mentionedHouse]}, vergeben durch ${
        msg.member!.displayName
      }\``,
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
