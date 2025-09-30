import { greetings } from "./message.js";
import { getUser, updateUser } from "./services/rpc.js";

console.log(`[PASS => import { greetings } from "./message.js";]:`, greetings); 
const user = getUser("vegeta");
updateUser(user, "power", 120000000000);