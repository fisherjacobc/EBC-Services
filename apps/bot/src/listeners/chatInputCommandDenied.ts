import { Events, Listener, type ChatInputCommandDeniedPayload, type UserError } from "@sapphire/framework";
import embed from "../resources/templates/embed";

export class ChatInputCommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.ChatInputCommandDenied,
    });
  }

  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        content: "",
        embeds: [embed.err(error.message)],
      });
    }

    return interaction.reply({
      content: "",
      embeds: [embed.err(error.message)],
      ephemeral: true,
    });
  }
}
