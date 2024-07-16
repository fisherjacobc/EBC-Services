import { Subcommand } from "@sapphire/plugin-subcommands";
import Config from "../#config";
import noblox from "noblox.js";
import bloxlinkGuild from "@codiium/bloxlink-api/guild";
import embed from "../resources/templates/embed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Guild,
  TextChannel,
  type User,
} from "discord.js";
import colors from "../resources/constants/colors";
import { rank } from "../resources/modules/roblox";

export class RankCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "rank",
      subcommands: [
        {
          name: "set",
          chatInputRun: "rankSet",
          preconditions: ["isDirectorate"],
        },
        {
          name: "suspend",
          chatInputRun: "rankSuspend",
          preconditions: ["isSupervisorOrAbove"],
        },
        {
          name: "busdriver",
          chatInputRun: "rankBusDriver",
          preconditions: ["canTrain"],
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("rank")
          .setDescription("Rank command") // Needed even though base command isn't displayed to end user
          .addSubcommand((command) =>
            command
              .setName("set")
              .setDescription("Set their rank")
              .addIntegerOption((option) =>
                option
                  .setName("rank")
                  .setDescription("The rank to set")
                  .addChoices(
                    Object.keys(Config.groupRanks).map((rank) => {
                      return {
                        name: Config.groupRanks[rank as keyof typeof Config.groupRanks].friendlyName,
                        value: Config.groupRanks[rank as keyof typeof Config.groupRanks].rankId,
                      };
                    }),
                  )
                  .setRequired(true),
              )
              .addStringOption((option) =>
                option
                  .setName("reason")
                  .setDescription("The reason for setting their rank")
                  .setRequired(true),
              )
              .addIntegerOption((option) =>
                option.setName("roblox_id").setDescription("The roblox ID of the user").setRequired(false),
              )
              .addStringOption((option) =>
                option
                  .setName("roblox_username")
                  .setDescription("The roblox username of the user")
                  .setRequired(false),
              )
              .addUserOption((option) =>
                option.setName("discord_user").setDescription("The discord user").setRequired(false),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("suspend")
              .setDescription("Submit a request to suspend a user")
              .addStringOption((option) =>
                option
                  .setName("reason")
                  .setDescription("The reason for requesting a suspension")
                  .setRequired(true),
              )
              .addIntegerOption((option) =>
                option.setName("roblox_id").setDescription("The roblox ID of the user").setRequired(false),
              )
              .addStringOption((option) =>
                option
                  .setName("roblox_username")
                  .setDescription("The roblox username of the user")
                  .setRequired(false),
              )
              .addUserOption((option) =>
                option.setName("discord_user").setDescription("The discord user").setRequired(false),
              ),
          )
          .addSubcommand((command) =>
            command
              .setName("busdriver")
              .setDescription("Submit a request to rank a user as a bus driver")
              .addStringOption((option) =>
                option
                  .setName("reason")
                  .setDescription(
                    "The reason for requesting to rank a user as a bus driver (ex: 'passed training')",
                  )
                  .setRequired(true),
              )
              .addIntegerOption((option) =>
                option.setName("roblox_id").setDescription("The roblox ID of the user").setRequired(false),
              )
              .addStringOption((option) =>
                option
                  .setName("roblox_username")
                  .setDescription("The roblox username of the user")
                  .setRequired(false),
              )
              .addUserOption((option) =>
                option.setName("discord_user").setDescription("The discord user").setRequired(false),
              ),
          ),
      {
        idHints: ["1262801402506248274"],
      },
    );
  }

  private async getRobloxUserIdFromInteraction(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = interaction.options.getInteger("roblox_id", false);
    if (robloxId) return robloxId;

    const robloxUsername = interaction.options.getString("roblox_username", false);
    if (robloxUsername) return await noblox.getIdFromUsername(robloxUsername);

    const discordUser = interaction.options.getUser("discord_user", false);
    if (!discordUser) {
      interaction.editReply({
        embeds: [
          embed.err(
            "You must supply at least one of the options: 'roblox_id', 'roblox_username', or 'discord_user'",
          ),
        ],
      });
      return undefined;
    }
    try {
      return Number.parseInt((await bloxlinkGuild.DiscordToRoblox(Config.guildId, discordUser.id)).robloxID);
    } catch (error) {
      interaction.editReply({
        embeds: [
          embed.err("They aren't linked with Bloxlink! Have them link their account, and then try again"),
        ],
      });
      return undefined;
    }
  }

  private async logRankChange(
    guild: Guild,
    executor: User,
    userId: number,
    rankId: number,
    reason: string,
    request = true,
  ) {
    const { client } = this.container;

    const logEmbed = new EmbedBuilder()
      .setColor(colors.Blank)
      .setDescription(
        `## Rank ${request ? "Request" : "Change"} Log${request ? `\n-# Requests can only be approved by <@&${Config.roleIds.associateSupervisor}> or above` : ""}`,
      )
      .addFields(
        {
          name: ":bust_in_silhouette: Roblox User",
          value: `[${await noblox.getUsernameFromId(userId)}](https://roblox.com/users/${userId})`,
        },
        {
          name: "Rank",
          value: `${(await noblox.getRole(Config.groupId, rankId)).name}`,
        },
        {
          name: ":pencil: Reason",
          value: reason,
        },
      )
      .setAuthor({
        name: `@${executor.username}`,
        iconURL: executor.displayAvatarURL(),
      })
      // biome-ignore lint/style/noNonNullAssertion: client exists
      .setThumbnail(client.user!.displayAvatarURL())
      .setFooter({
        // biome-ignore lint/style/noNonNullAssertion: client exists
        text: client.user!.username,
        // biome-ignore lint/style/noNonNullAssertion: client exists
        iconURL: client.user!.displayAvatarURL(),
      })
      .setTimestamp();

    const approveButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Approve")
      .setCustomId(`${userId}:${rankId}@rank.approve`);
    const denyButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Deny")
      .setCustomId(`${userId}:${rankId}@rank.deny`);

    if (!request) {
      approveButton.setLabel("Approved").setDisabled(true);

      denyButton.setStyle(ButtonStyle.Secondary).setDisabled(true);

      rank(userId, rankId);
    }

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton);

    const rankChangesChannel = (await guild.channels.fetch(Config.channels.rankChanges)) as TextChannel;

    rankChangesChannel.send({
      embeds: [logEmbed],
      components: [buttonsRow],
    });
  }

  public async rankSet(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = await this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;

    const rank = interaction.options.getInteger("rank", true);
    const reason = interaction.options.getString("reason", true);

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    await this.logRankChange(interaction.guild!, interaction.user, robloxId, rank, reason, false);

    return interaction.reply({
      embeds: [embed.information("Rank successfully set")],
      ephemeral: true,
    });
  }

  public async rankSuspend(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = await this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;

    const reason = interaction.options.getString("reason", true);

    await this.logRankChange(
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      interaction.guild!,
      interaction.user,
      robloxId,
      Config.groupRanks.administrativeLeave.rankId,
      reason,
    );

    return interaction.reply({
      embeds: [embed.information("Rank change successfully requested")],
      ephemeral: true,
    });
  }

  public async rankBusDriver(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = await this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;

    const reason = interaction.options.getString("reason", true);

    await this.logRankChange(
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      interaction.guild!,
      interaction.user,
      robloxId,
      Config.groupRanks.administrativeLeave.rankId,
      reason,
    );

    return interaction.reply({
      embeds: [embed.information("Rank change successfully requested")],
      ephemeral: true,
    });
  }
}
