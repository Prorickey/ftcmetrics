import 'dotenv/config';
import { Client } from "ftcmetrics-api";

(async () => {

    const client = new Client(
        process.env.FTC_API_USERNAME as string, 
        process.env.FTC_API_TOKEN as string,
        process.env.FTC_PROD_URL
    )

    for(let i = 0; i < 29; i++) {
        const data = await client.teams(2025, i)
    }

    // while(true) {
    //     const data = await client.ping()
    //     console.log(data)
    //     await new Promise((res) => setTimeout(res, 5000))
    // }
})();