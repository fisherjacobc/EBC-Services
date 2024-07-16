import { container } from "@sapphire/framework";
import noblox, { type LoggedInUserData } from "noblox.js";

let currentUser: LoggedInUserData;
let groupId: number;

export const rank = async (userId: number, rank: number) => {
  await noblox.setRank(groupId, userId, rank);
};

export const initialize = async (robloxCookie: string, _groupId: number) => {
  currentUser = await noblox.setCookie(robloxCookie);
  groupId = _groupId;

  container.logger.info(`Logged in to Roblox as ${currentUser.UserName} (${currentUser.UserID})`);
};
