import 'dotenv/config';
import { Client } from "ftcmetrics-api";
import { updateAllTeams } from './teams.js';
import { updateAllEvents } from './events.js';
import { updateAllMatches } from './matchResults.js';

const client = new Client(
    process.env.FTC_API_USERNAME as string, 
    process.env.FTC_API_TOKEN as string,
    process.env.FTC_PROD_URL
)

//await updateAllTeams(client, 2025)
//await updateAllEvents(client, 2025)
await updateAllMatches(client, 2025)