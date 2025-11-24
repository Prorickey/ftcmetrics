import { Client, MatchResultModel } from "ftcmetrics-api"
import { prisma } from "./db.js"

export async function updateAllMatches(client: Client, season: number) {
    // First, get all events for this season
    const eventData = await client.events(season)
    const allEvents = eventData.events || []

    console.log(`Fetching matches for ${allEvents.length} events`)

    let allMatches: Array<MatchResultModel & { eventCode: string }> = []

    // Fetch matches for each event
    for (const event of allEvents) {
        const matchData = await client.eventMatches(season, event.code)
        const matches = matchData.matches || []
        
        // Add eventCode to each match for database lookup
        allMatches = allMatches.concat(
            matches.map(match => ({
                ...match,
                eventCode: event.code
            }))
        )
    }

    console.log(`Fetched ${allMatches.length} total matches from API`)

    // Get all existing matches from database
    const existingMatches = await prisma.match.findMany({
        select: {
            id: true,
            matchNumber: true,
            description: true,
            tournamentLevel: true,
            series: true,
            actualStartTime: true,
            postResultTime: true,
            modifiedOn: true,
            scoreRedFinal: true,
            scoreBlueFinal: true,
            scoreRedFoul: true,
            scoreBlueFoul: true,
            scoreRedAuto: true,
            scoreBlueAuto: true,
            eventId: true,
            event: {
                select: {
                    code: true
                }
            }
        }
    })

    console.log(`Found ${existingMatches.length} existing matches in database`)

    // Create a map for quick lookup using eventCode + matchNumber
    const existingMatchMap = new Map(
        existingMatches.map(m => [`${m.event.code}:${m.matchNumber}`, m])
    )

    // Separate matches into create and update
    const toCreate: Array<{
        matchNumber: number;
        description: string | null;
        field: string | null;
        tournamentLevel: string | null;
        series: number;
        actualStartTime: Date | null;
        postResultTime: Date | null;
        modifiedOn: Date | null;
        scoreRedFinal: number;
        scoreBlueFinal: number;
        scoreRedFoul: number;
        scoreBlueFoul: number;
        scoreRedAuto: number;
        scoreBlueAuto: number;
        eventId: string;
        teams: {
            create: Array<{
                teamId: string;
                station: string | null;
                dq: boolean;
                onField: boolean;
            }>;
        };
    }> = []

    const toUpdate: Array<{
        matchId: string;
        data: Partial<MatchResultModel>;
        teamUpdates: Array<{
            teamNumber: number;
            station: string | null;
            dq: boolean;
            onField: boolean;
        }>;
    }> = []

    for (const apiMatch of allMatches) {
        // Find the event ID for this match
        const event = await prisma.event.findFirst({
            where: { code: apiMatch.eventCode },
            select: { id: true }
        })

        if (!event) {
            console.warn(`Event with code ${apiMatch.eventCode} not found in database, skipping matches`)
            continue
        }

        const existingMatch = existingMatchMap.get(`${apiMatch.eventCode}:${apiMatch.matchNumber}`)

        if (!existingMatch) {
            // Get team IDs from database
            const teamUpdates = apiMatch.teams || []
            const teamIds = await Promise.all(
                teamUpdates.map(async (t) => {
                    const team = await prisma.team.findFirst({
                        where: { teamNumber: t.teamNumber },
                        select: { id: true }
                    })
                    return {
                        teamId: team?.id,
                        teamNumber: t.teamNumber,
                        station: t.station || null,
                        dq: t.dq || false,
                        onField: !t.noShow
                    }
                })
            )

            toCreate.push({
                matchNumber: apiMatch.matchNumber,
                description: apiMatch.description || null,
                field: apiMatch.field || null,
                tournamentLevel: apiMatch.tournamentLevel || null,
                series: apiMatch.series || 0,
                actualStartTime: apiMatch.startTime ? new Date(apiMatch.startTime) : null,
                postResultTime: null,
                modifiedOn: apiMatch.modifiedOn ? new Date(apiMatch.modifiedOn) : null,
                scoreRedFinal: apiMatch.scoreRedFinal || 0,
                scoreBlueFinal: apiMatch.scoreBlueFinal || 0,
                scoreRedFoul: 0,
                scoreBlueFoul: 0,
                scoreRedAuto: 0,
                scoreBlueAuto: 0,
                eventId: event.id,
                teams: {
                    create: teamIds
                        .filter(t => t.teamId) // Only create relations for found teams
                        .map(t => ({
                            teamId: t.teamId!,
                            station: t.station,
                            dq: t.dq,
                            onField: t.onField
                        }))
                }
            })
        } else {
            // Check if any field has changed
            const hasChanges = hasMatchChanged(existingMatch, apiMatch)
            if (hasChanges) {
                const teamUpdates = apiMatch.teams || []

                toUpdate.push({
                    matchId: existingMatch.id,
                    data: {
                        matchNumber: apiMatch.matchNumber,
                        description: apiMatch.description || null,
                        field: apiMatch.field || null,
                        tournamentLevel: apiMatch.tournamentLevel || null,
                        series: apiMatch.series || 0,
                        actualStartTime: apiMatch.startTime ? new Date(apiMatch.startTime) : null,
                        postResultTime: null,
                        modifiedOn: apiMatch.modifiedOn ? new Date(apiMatch.modifiedOn) : null,
                        scoreRedFinal: apiMatch.scoreRedFinal || 0,
                        scoreBlueFinal: apiMatch.scoreBlueFinal || 0,
                    } as any,
                    teamUpdates: await Promise.all(
                        teamUpdates.map(async (t) => {
                            const team = await prisma.team.findFirst({
                                where: { teamNumber: t.teamNumber },
                                select: { id: true }
                            })
                            return {
                                teamNumber: t.teamNumber,
                                station: t.station || null,
                                dq: t.dq || false,
                                onField: !t.noShow
                            }
                        })
                    )
                })
            }
        }
    }

    console.log(`Creating ${toCreate.length} new matches`)
    console.log(`Updating ${toUpdate.length} changed matches`)

    // Create new matches with team relations
    if (toCreate.length > 0) {
        for (const match of toCreate) {
            await prisma.match.create({
                data: match
            })
        }
        console.log(`✓ Created ${toCreate.length} matches`)
    }

    // Update changed matches and their team relations
    for (const { matchId, data, teamUpdates } of toUpdate) {
        // Delete old team relations
        await prisma.matchTeam.deleteMany({
            where: { matchId }
        })

        // Resolve team IDs for team updates
        const resolvedTeamUpdates = await Promise.all(
            teamUpdates.map(async (t) => {
                const team = await prisma.team.findFirst({
                    where: { teamNumber: t.teamNumber },
                    select: { id: true }
                })
                return {
                    teamId: team?.id,
                    station: t.station,
                    dq: t.dq,
                    onField: t.onField
                }
            })
        )

        // Update match data and create new team relations
        await prisma.match.update({
            where: { id: matchId },
            data: {
                ...data,
                teams: {
                    create: resolvedTeamUpdates
                        .filter(t => t.teamId)
                        .map(t => ({
                            teamId: t.teamId!,
                            station: t.station,
                            dq: t.dq,
                            onField: t.onField
                        }))
                }
            }
        })
    }
    if (toUpdate.length > 0) {
        console.log(`✓ Updated ${toUpdate.length} matches`)
    }

    console.log('Match update complete')
}


function hasMatchChanged(existing: any, apiMatch: MatchResultModel): boolean {
    const fieldsToCheck = [
        'matchNumber',
        'description',
        'field',
        'tournamentLevel',
        'series',
        'scoreRedFinal',
        'scoreBlueFinal',
        'modifiedOn'
    ] as const

    return fieldsToCheck.some(field => {
        let existingValue = existing[field]
        let apiValue = apiMatch[field as keyof MatchResultModel]

        // Convert Date objects to ISO strings for comparison
        if (existingValue instanceof Date) existingValue = existingValue.toISOString()
        if (apiValue instanceof Date) apiValue = apiValue.toISOString()

        // Treat null and undefined as the same
        const existingNormalized = existingValue ?? null
        const apiNormalized = apiValue ?? null

        return existingNormalized !== apiNormalized
    })
}
