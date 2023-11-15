import {
  Client,
  Guild,
  GuildManager,
  GuildScheduledEvent,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from 'discord.js';
import { getChannelsOfGuild } from './shared_assets';

const startingHour = 20;

function getLastSunday(year: number, month: number) {
  const date = new Date(year, month + 1, 1, startingHour);
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

async function announceEvent(guild: Guild, event: GuildScheduledEvent) {
  const eventAnnouncementChannel = await guild.channels.fetch(
    getChannelsOfGuild(guild.id).eventAnnouncementChannel,
  );
  if (eventAnnouncementChannel && eventAnnouncementChannel.isTextBased()) {
    eventAnnouncementChannel.send(`Der nächste Stammtisch wurde geplant!
${event.url}`);
  }
}

const eventName = 'Stammtisch';

async function createEventIfNoneExist(
  guildManager: GuildManager,
  authorName: string,
) {
  const guilds = await guildManager.fetch();

  const promises = guilds.map(async (partialGuild) => {
    const entireGuild = await partialGuild.fetch();
    const existingScheduledEvents = await entireGuild.scheduledEvents.fetch();
    const stammtischEventExists = existingScheduledEvents.some((event) => event.name.toLowerCase().includes(eventName.toLowerCase()));

    if (!stammtischEventExists) {
      const channelId = getChannelsOfGuild(entireGuild.id).eventVoiceChannel;
      const voiceChannel = await entireGuild.channels.fetch(channelId);

      if (voiceChannel && voiceChannel.isVoiceBased()) {
        const startTime = getNextEventDate();

        const event = await entireGuild.scheduledEvents.create({
          name: eventName,
          description: `Der monatliche Stammtisch zum vorletzten Sonntag im Monat.
            
Dieses Event wurde automatisch von ${authorName} generiert.`,
          entityType: GuildScheduledEventEntityType.Voice,
          channel: voiceChannel,
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          scheduledStartTime: startTime,
        });

        await announceEvent(entireGuild, event);
      }
    }
  });

  await Promise.all(promises);
}

export function handleScheduledEvents(bot: Client) {
  const guildManager = bot.guilds;
  const authorName = bot.user?.username ?? 'Hogwarts But Better Bot';

  createEventIfNoneExist(guildManager, authorName);

  // Check every 6 hours to make sure there is an event
  setInterval(
    async () => {
      await createEventIfNoneExist(guildManager, authorName);
    },
    1000 * 60 * 60 * 6,
  );
}
