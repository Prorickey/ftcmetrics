import { Client, EventModel } from "ftcmetrics-api"
import { prisma } from "./db.js"

export async function updateAllEvents(client: Client, season: number) {
    const data = await client.events(season)
    let events: EventModel[] = data.events!

    // Remove coordinates field and convert dates from all events
    events = events.map(event => {
        const { coordinates, ...eventWithoutCoordinates } = event as any
        return {
            ...eventWithoutCoordinates,
            dateStart: event.dateStart ? new Date(event.dateStart) : null,
            dateEnd: event.dateEnd ? new Date(event.dateEnd) : null,
        } as EventModel
    })

    console.log(`Fetched ${events.length} events from API`)

    // Get all existing events from database
    const existingEvents = await prisma.event.findMany({
        select: {
            id: true,
            eventId: true,
            code: true,
            divisionCode: true,
            name: true,
            remote: true,
            hybrid: true,
            fieldCount: true,
            published: true,
            type: true,
            typeName: true,
            regionCode: true,
            leagueCode: true,
            districtCode: true,
            venue: true,
            address: true,
            city: true,
            stateprov: true,
            country: true,
            website: true,
            liveStreamUrl: true,
            timezone: true,
            dateStart: true,
            dateEnd: true,
        }
    })

    console.log(`Found ${existingEvents.length} existing events in database`)

    // Create a map for quick lookup
    const existingEventMap = new Map(existingEvents.map(e => [e.code, e]))

    // Separate events into create and update
    const toCreate: typeof events = []
    const toUpdate: Array<{ id: string, data: Partial<EventModel>, webcasts: string[] }> = []

    events.forEach(event => {
        const existing = existingEventMap.get(event.code)
        
        if (!existing) {
            toCreate.push(event)
        } else {
            // Check if any field has changed
            const hasChanges = hasEventChanged(existing, event)
            if (hasChanges) {
                toUpdate.push({ 
                    id: existing.id, 
                    data: event,
                    webcasts: event.webcasts || []
                })
            }
        }
    })

    console.log(`Creating ${toCreate.length} new events`)
    console.log(`Updating ${toUpdate.length} changed events`)

    // Create new events with webcasts
    if (toCreate.length > 0) {
        for (const event of toCreate) {
            const webcasts = event.webcasts || []
            const { webcasts: _, ...eventData } = event as any
            
            await prisma.event.create({
                data: {
                    ...eventData,
                    webcasts: {
                        create: webcasts.map(url => ({ url }))
                    }
                }
            })
        }
        console.log(`✓ Created ${toCreate.length} events`)
    }

    // Update changed events
    for (const { id, data, webcasts } of toUpdate) {
        const { webcasts: _, ...eventData } = data as any
        
        // Delete old webcasts and create new ones
        await prisma.webcast.deleteMany({
            where: { eventId: id }
        })
        
        await prisma.event.update({
            where: { id },
            data: {
                ...eventData,
                webcasts: {
                    create: webcasts.map(url => ({ url }))
                }
            }
        })
    }
    if (toUpdate.length > 0) {
        console.log(`✓ Updated ${toUpdate.length} events`)
    }

    console.log('Event update complete')
}

function hasEventChanged(existing: any, apiEvent: EventModel): boolean {
    const fieldsToCheck = [
        'eventId', 'divisionCode', 'name', 'remote', 'hybrid', 'fieldCount',
        'published', 'type', 'typeName', 'regionCode', 'leagueCode', 'districtCode',
        'venue', 'address', 'city', 'stateprov', 'country', 'website', 'liveStreamUrl',
        'timezone', 'dateStart', 'dateEnd'
    ] as const
    
    return fieldsToCheck.some(field => {
        let existingValue = existing[field]
        let apiValue = apiEvent[field as keyof EventModel]
        
        // Convert Date objects to ISO strings for comparison
        if (existingValue instanceof Date) existingValue = existingValue.toISOString()
        if (apiValue instanceof Date) apiValue = apiValue.toISOString()
        
        // Treat null and undefined as the same
        const existingNormalized = existingValue ?? null
        const apiNormalized = apiValue ?? null
        
        return existingNormalized !== apiNormalized
    })
}
