import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        "http://localhost:3000/api/auth/google/callback"
    );

    // Scopes for getting the user's email (and optionally profile)
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        // 'https://www.googleapis.com/auth/userinfo.profile' // optional
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // optional — only needed if you want a refresh token
        scope: scopes,
    });

    return Response.redirect(url)
}