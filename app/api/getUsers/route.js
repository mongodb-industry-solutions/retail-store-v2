import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function POST() {
    const client = await clientPromise
    const db = client.db(dbName);
    const collection = db.collection("users");

    const users = await collection.find({}).toArray();

    const serialized = users.map((u) => ({
        ...u,
        _id: u._id.toString(),
        type: u.type === "owner" ? "owner" : "customer",
    }));

    return NextResponse.json({ users: serialized }, { status: 200 });
}