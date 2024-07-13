import { Events, Listener } from "@sapphire/framework";
import { ActivityType, type Client } from "discord.js";

export class ClientReadyListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.ClientReady,
      once: true,
    });
  }

  public run(client: Client) {
    client.logger.info(
      `Bot Client Logged in as ${client.user!.tag} (${client.application?.id})`
    );

    client.user!.setActivity({
      type: ActivityType.Watching,
      name: "over EBC",
    });
  }
}
