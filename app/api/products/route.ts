import { NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  await dbConnect();
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  await dbConnect();
  const data = await request.json();
  const product = new Product(data);
  await product.save();
  return NextResponse.json(product);
}
