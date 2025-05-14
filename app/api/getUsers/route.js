import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function POST() {
    const client = await clientPromise
    const db = client.db(dbName);
    const collection = db.collection("users");

    const users = await collection
        .find({})
        .toArray();

    return NextResponse.json({ users }, { status: 200 });
}