import { Client, TeamModel } from "ftcmetrics-api"
import { prisma } from "./db.js"

export async function updateAllTeams(client: Client, season: number) {
    let teams: TeamModel[] = []
    const data = await client.teams(season)
    teams = data.teams!

    for(let p = 2; p <= data.pageTotal; p++) {
        const data = await client.teams(season, { page: p })
        teams = teams.concat(data.teams!)
    }

    console.log(`Fetched ${teams.length} teams from API`)

    // Get all existing teams from database
    const existingTeams = await prisma.team.findMany({
        select: {
            id: true,
            teamNumber: true,
            displayTeamNumber: true,
            teamId: true,
            teamProfileId: true,
            nameFull: true,
            nameShort: true,
            schoolName: true,
            city: true,
            stateProv: true,
            country: true,
            website: true,
            rookieYear: true,
            robotName: true,
            districtCode: true,
            homeCMP: true,
            homeRegion: true,
            displayLocation: true,
        }
    })

    console.log(`Found ${existingTeams.length} existing teams in database`)

    // Create a map for quick lookup
    const existingTeamMap = new Map(existingTeams.map(t => [t.teamNumber, t]))

    // Separate teams into create and update
    const toCreate: typeof teams = []
    const toUpdate: Array<{ id: string, data: Partial<TeamModel> }> = []

    teams.forEach(team => {
        const existing = existingTeamMap.get(team.teamNumber)
        
        if (!existing) {
            toCreate.push(team)
        } else {
            // Check if any field has changed
            const hasChanges = hasTeamChanged(existing, team)
            if (hasChanges) {
                toUpdate.push({ 
                    id: existing.id, 
                    data: team 
                })
            }
        }
    })

    console.log(`Creating ${toCreate.length} new teams`)
    console.log(`Updating ${toUpdate.length} changed teams`)

    // Create new teams
    if (toCreate.length > 0) {
        await prisma.team.createMany({ data: toCreate })
        console.log(`✓ Created ${toCreate.length} teams`)
    }

    // Update changed teams
    for (const { id, data } of toUpdate) {
        await prisma.team.update({
            where: { id },
            data
        })
    }
    if (toUpdate.length > 0) {
        console.log(`✓ Updated ${toUpdate.length} teams`)
    }

    console.log('Team update complete')
}

function hasTeamChanged(existing: any, apiTeam: TeamModel): boolean {
    const fieldsToCheck = [
        'displayTeamNumber', 'teamId', 'teamProfileId', 'nameFull', 'nameShort',
        'schoolName', 'city', 'stateProv', 'country', 'website', 'rookieYear',
        'robotName', 'districtCode', 'homeCMP', 'homeRegion', 'displayLocation'
    ] as const
    
    return fieldsToCheck.some(field => {
        const existingValue = existing[field]
        const apiValue = apiTeam[field as keyof TeamModel]
        
        // Treat null and undefined as the same
        const existingNormalized = existingValue ?? null
        const apiNormalized = apiValue ?? null
        
        return existingNormalized !== apiNormalized
    })
}