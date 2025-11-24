import 'dotenv/config';
import { Client } from "ftcmetrics-api";
import { updateAllTeams } from './teams.js';

const client = new Client(
    process.env.FTC_API_USERNAME as string, 
    process.env.FTC_API_TOKEN as string,
    process.env.FTC_PROD_URL
)

//await updateAllTeams(client, 2025)
