import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  type ButtonInteraction,
  type TextChannel,
} from "discord.js";
import bloxlinkGuild from "@codiium/bloxlink-api/guild";
import embed from "../resources/templates/embed";
import noblox from "noblox.js";
import Config from "../#config";
import { lexer } from "marked";
import { announceToGuilded, convertToGuilded } from "../resources/modules/convertToGuilded";

export class OperationButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    if (!interaction.customId.startsWith(interaction.member!.user.id)) return this.none();
    if (interaction.customId.endsWith("host.post")) return this.some<boolean>(true);
    if (interaction.customId.endsWith("host.cancel")) return this.some<boolean>(false);

    return this.none();
  }

  public async run(interaction: ButtonInteraction, post: boolean) {
    if (post) {
      const training = interaction.message.content.includes("`training`");

      const routesChannel = await interaction.guild?.channels.fetch(Config.channels.routes);
      const trainingsChannel = await interaction.guild?.channels.fetch(Config.channels.trainings);

      try {
        if (training) {
          (trainingsChannel as TextChannel).send({
            content: `<@&${Config.roleIds.studentDriver}>`,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            embeds: [interaction.message.embeds[0]!],
          });
        } else {
          (routesChannel as TextChannel).send({
            content: `<@&${Config.roleIds.busDriver}>`,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            embeds: [interaction.message.embeds[0]!],
          });
        }
      } catch (error) {
        return interaction.update({
          content: `## Cancelled
            Post has been cancelled due to an error.`,
          components: [],
        });
      }
      const timeRegex: RegExpMatchArray =
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        interaction.message.embeds[0]!.fields[2]!.value.match(/(\d+)/)!;
      const time = new Date(0);
      time.setSeconds(Number.parseInt(timeRegex[0]) + 3600);

      const timeLater = new Date(0);
      timeLater.setSeconds(Number.parseInt(timeRegex[0]) + 9000);

      (await this.container.client.guilds.fetch(Config.guildId)).scheduledEvents.create({
        name: training ? "EBC CDL Training" : "Route: Redwater, Virginia",
        scheduledStartTime: time,
        scheduledEndTime: timeLater,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        description: `A ${training ? "CDL Training is being hosted" : "Route is being hosted in Redwater, Virginia"}`,
        entityMetadata: {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          location: interaction.message.embeds[0]!.fields[4]!.value,
        },
        image: null,
        reason: `Triggered by @${interaction.user.username}`,
      });

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const discordId = interaction.message.embeds[0]!.fields[0]!.value.split("<@")[1]!.split(">")[0]!;

      try {
        const bloxlinkUser = (await bloxlinkGuild.DiscordToRoblox(Config.guildId, discordId)).robloxID;

        const robloxUsername = await noblox.getUsernameFromId(Number.parseInt(bloxlinkUser));

        const stringTime = `${time.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })} EST on ${time.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}`;

        const parsed = lexer(
          training
            ? `# CDL Training\nA CDL Training is being hosted by ${robloxUsername} at ${stringTime}\n\nYou can join the game using the link below:\nhttps://www.roblox.com/games/6817047049/EBC-CDL-Training-Center`
            : `# Route\nA Route in Redwater, Virginia is being hosted by ${robloxUsername} at ${stringTime}\n\nYou can join the game using the link below:\nhttps://www.roblox.com/games/12254854680/Redwater-Virginia`,
        );

        const convertedToGuilded = convertToGuilded(parsed);
        await announceToGuilded(convertedToGuilded);
      } catch (error) {
        console.log(error);
      }

      return interaction.update({
        content: "",
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        embeds: [embed.success("Successfully posted!"), interaction.message.embeds[0]!],
        components: [],
      });
    } else {
      return interaction.update({
        content: "",
        embeds: [embed.notification("Cancelled post")],
        components: [],
      });
    }
  }
}
