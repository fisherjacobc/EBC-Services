import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  type ButtonInteraction,
} from "discord.js";
import Config from "../#config";
import { rank } from "../resources/modules/roblox";
import embed from "../resources/templates/embed";
import { EmbedBuilder } from "@discordjs/builders";
import emojis from "../resources/constants/emojis";

export class OperationButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (
      !(
        (interaction.member as GuildMember).roles.cache.has(Config.roleIds.associateSupervisor) ||
        (interaction.member as GuildMember).roles.cache.has(Config.roleIds.coordinator) ||
        (interaction.member as GuildMember).roles.cache.has(Config.roleIds.governingBoard)
      )
    )
      return this.none();

    if (interaction.customId.endsWith("rank.approve")) return this.some<boolean>(true);
    if (interaction.customId.endsWith("rank.deny")) return this.some<boolean>(false);

    return this.none();
  }

  public async run(interaction: ButtonInteraction, rankUser: boolean) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const [userId, rankId] = interaction.customId.split("@")[0]!.split(":") as [string, string];

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const updatedEmbed = new EmbedBuilder(interaction.message.embeds[0]!.toJSON());
    updatedEmbed.addFields({
      name: rankUser ? `${emojis.main.success} Approved By` : `${emojis.main.error} Denied By`,
      value: `<@${interaction.user.id}>`,
    });

    const approveButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Approve")
      .setCustomId(`${userId}:${rankId}@rank.approve`);
    const denyButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Deny")
      .setCustomId(`${userId}:${rankId}@rank.deny`);

    if (rankUser) {
      approveButton.setLabel("Approved").setDisabled(true);

      denyButton.setStyle(ButtonStyle.Secondary).setDisabled(true);

      rank(Number.parseInt(userId), Number.parseInt(rankId));
    } else {
      denyButton.setLabel("Denied").setDisabled(true);

      approveButton.setStyle(ButtonStyle.Secondary).setDisabled(true);
    }

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton);

    interaction.message.edit({
      embeds: [updatedEmbed],
      components: [buttonsRow],
    });

    return interaction.reply({
      embeds: [embed.information(`Rank change successfully ${rankUser ? "approved" : "denied"}`)],
      ephemeral: true,
    });
  }
}
