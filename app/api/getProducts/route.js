import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function POST(request) {

    const filters = await request.json();

    const client = await clientPromise
    const db = client.db(dbName);
    const collection = db.collection("products");

    let queryBrand = {};
    let queryCategory = {};

    if (filters.selectedBrands && filters.selectedBrands.length > 0) {
        queryBrand = { brand: { $in: filters.selectedBrands } };

    }

    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
        queryCategory = { masterCategory: { $in: filters.selectedCategories } };

    }


    const products = await collection
        .find({ "$and": [queryBrand, queryCategory] }, { projection: { name: 1, price: 1, brand: 1, image: 1, _id: 1 } })
        .toArray();

    //console.log(products.items.name);
    return NextResponse.json({ products }, { status: 200 });
}