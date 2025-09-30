import characters from "../characters.js";
import { success } from "../message.js";

export function getUser(key) {
  return characters[key];
};

export function updateUser(user, attributeName, attributeValue) {
  user[attributeName] = attributeValue;
  console.log(`[PASS => updateUser in rpc.js][${success}]: User data is successfully updated!`, characters);
};