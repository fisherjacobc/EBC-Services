import { Subcommand } from "@sapphire/plugin-subcommands";
import Config from "../#config";
import noblox from "noblox.js";
import bloxlinkGuild from "@codiium/bloxlink-api/guild";
import embed from "../resources/templates/embed";

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
                        value: Config.groupRanks[rank as keyof typeof Config.groupRanks].roleId,
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

  public async rankSet(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;
  }

  public async rankSuspend(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;
  }

  public async rankBusDriver(interaction: Subcommand.ChatInputCommandInteraction) {
    const robloxId = this.getRobloxUserIdFromInteraction(interaction);
    if (!robloxId) return;
  }
}
