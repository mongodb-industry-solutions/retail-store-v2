import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function POST(request) {
    try {
        const { 
            aggregatePipeline,
            collectionName,
            databaseName = dbName,
            options = {}
        } = await request.json();

        // Validate required parameters
        if (!aggregatePipeline || !Array.isArray(aggregatePipeline)) {
            return NextResponse.json(
                { error: 'Missing or invalid aggregatePipeline. Must be an array.' },
                { status: 400 }
            );
        }

        if (!collectionName || typeof collectionName !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid collectionName. Must be a string.' },
                { status: 400 }
            );
        }

        console.log(`Executing aggregation on collection: ${collectionName}`);
        console.log('Aggregation pipeline:', JSON.stringify(aggregatePipeline, null, 2));

        // Get MongoDB client and collection
        const client = await clientPromise;
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        // Execute aggregation
        const result = await collection
            .aggregate(aggregatePipeline, options)
            .toArray();

        console.log(`Aggregation completed. Found ${result.length} results.`);

        return NextResponse.json({ 
            success: true,
            result: result,
            count: result.length,
            collection: collectionName,
            database: databaseName
        }, { status: 200 });

    } catch (error) {
        console.error('Error executing aggregation:', error);
        
        return NextResponse.json(
            { 
                error: 'Aggregation failed', 
                details: error.message,
                success: false
            },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    return NextResponse.json(
        { 
            message: 'MongoDB Aggregation API',
            description: 'POST aggregation pipelines to execute on specified collections',
            usage: {
                method: 'POST',
                body: {
                    aggregatePipeline: 'Array - MongoDB aggregation pipeline stages',
                    collectionName: 'String - Name of the collection to aggregate',
                    databaseName: 'String (optional) - Database name, defaults to configured database',
                    options: 'Object (optional) - MongoDB aggregation options'
                }
            },
            example: {
                aggregatePipeline: [
                    { $match: { status: 'active' } },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                collectionName: 'products'
            }
        },
        { status: 200 }
    );
}