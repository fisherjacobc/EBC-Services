import { Subcommand } from "@sapphire/plugin-subcommands";
import { parseDate } from "chrono-node";

export class HostCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "host",
      subcommands: [
        {
          name: "route",
          chatInputRun: "hostRoute",
        },
        {
          name: "training",
          chatInputRun: "hostTraining",
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("host")
        .setDescription("Host command") // Needed even though base command isn't displayed to end user
        .addSubcommand((command) =>
          command
            .setName("route")
            .setDescription("Host a route")
            .addStringOption((option) =>
              option
                .setName("time")
                .setDescription("The time this will be hosted (can be relative or exact time)")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("notes").setDescription("(Optional) Notes for the Route").setRequired(false),
            )
            .addUserOption((option) =>
              option.setName("co-host").setDescription("(Optional) Route Co-Host").setRequired(false),
            ),
        )
        .addSubcommand((command) =>
          command
            .setName("training")
            .setDescription("Host a training")
            .addStringOption((option) =>
              option
                .setName("time")
                .setDescription("The time this will be hosted (can be relative or exact time)")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option.setName("notes").setDescription("(Optional) Notes for the Route").setRequired(false),
            )
            .addUserOption((option) =>
              option.setName("co-host").setDescription("(Optional) Training Co-Host").setRequired(false),
            ),
        ),
    );
  }

  public async hostRoute(interaction: Subcommand.ChatInputCommandInteraction) {
    const { options: args } = interaction;

    const host = interaction.member;
    const time = args.getString("time", true);

    const parsedTime = parseDate(time, {
      timezone: "ET",
    });

    return interaction.reply({ content: `${parsedTime}` });
  }
}
