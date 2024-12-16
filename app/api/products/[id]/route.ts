import { NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";
import dbConnect from "@/lib/mongodb";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  await dbConnect();
  const data = await request.json();
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  await dbConnect();
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Product deleted successfully" });
}
