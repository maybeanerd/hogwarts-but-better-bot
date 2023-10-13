import {
  Client,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  VoiceBasedChannel,
} from 'discord.js';
import { getChannelsOfGuild } from './shared_assets';

const startingHour = 20;

function getLastSunday(year: number, month: number) {
  const date = new Date(year, month, 1, startingHour);
  const weekday = date.getDay();
  const dayDiff = weekday === 0 ? 7 : weekday;
  date.setDate(date.getDate() - dayDiff);
  return date;
}

function getSecondLastSunday(year: number, month: number) {
  const date = getLastSunday(year, month);
  date.setDate(date.getDate() - 7);
  return date;
}

function getNextEventDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const eventDate = getSecondLastSunday(year, month);

  // If the day is in the future, use it
  if (now.getTime() < eventDate.getTime()) {
    return eventDate;
  }
  // If the month is the last, wrap around to the next year
  if (month === 11) {
    return getSecondLastSunday(year + 1, 0);
  }
  // Else, use the next month
  return getSecondLastSunday(year, month + 1);
}

async function createEventIfNoneExist(bot: Client) {
  const guilds = await bot.guilds.fetch();

  const promises = guilds.map(async (partialGuild) => {
    const entireGuild = await partialGuild.fetch();
    const existingScheduledEvents = await entireGuild.scheduledEvents.fetch();

    if (existingScheduledEvents.size === 0) {
      const channelId = getChannelsOfGuild(entireGuild.id).eventVoiceChannel;
      const voiceChannel = (await entireGuild.channels.fetch(
        channelId,
      )) as VoiceBasedChannel | null;

      if (voiceChannel) {
        entireGuild.scheduledEvents.create({
          name: 'Stammtisch',
          description: `Der monatliche Stammtisch zum vorletzten Sonntag im Monat.
            
Dieses Event wurde automatisch von ${bot.user?.displayName} generiert.`,
          entityType: GuildScheduledEventEntityType.Voice,
          channel: voiceChannel,
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          scheduledStartTime: getNextEventDate(),
        });
      }
    }
  });

  await Promise.all(promises);
}

export function handleScheduledEvents(bot: Client) {
  createEventIfNoneExist(bot);

  // Check every 10 minutes to make sure there is an event
  setInterval(
    async () => {
      await createEventIfNoneExist(bot);
    },
    1000 * 60 * 10,
  );
}
