import { container } from "@sapphire/framework";
import noblox, { type LoggedInUserData } from "noblox.js";
import Config from "../../#config";

let currentUser: LoggedInUserData;

export const rank = async (userId: number, rank: number) => {
  await noblox.setRank(Config.groupId, userId, rank);
};

export const initialize = async (robloxCookie: string, _groupId: number) => {
  currentUser = await noblox.setCookie(robloxCookie);

  container.logger.info(`Logged in to Roblox as ${currentUser.UserName} (${currentUser.UserID})`);
};
