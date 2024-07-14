import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction, TextChannel } from "discord.js";
import bloxlinkGuild from "@codiium/bloxlink-api/guild";
import embed from "../resources/templates/embed";
import noblox from "noblox.js";
import Config from "../#config";

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
      const routesChannel = await interaction.guild?.channels.fetch(Config.channels.routes);
      const trainingsChannel = await interaction.guild?.channels.fetch(Config.channels.trainings);

      try {
        if (interaction.message.content.includes("`training`")) {
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

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const discordId = interaction.message.embeds[0]!.fields[0]!.value.split("<@")[1]!.split(">")[0]!;

      try {
        const bloxlinkUser = (await bloxlinkGuild.DiscordToRoblox(Config.guildId, discordId)).robloxID;

        const robloxUsername = await noblox.getUsernameFromId(Number.parseInt(bloxlinkUser));
        const timeRegex: RegExpMatchArray | null =
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          interaction.message.embeds[0]!.fields[2]!.value.match(/(\d+)/);
        const time = new Date(1970, 0, 1);
        if (timeRegex != null) time.setSeconds(Number.parseInt(timeRegex[0]));
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
