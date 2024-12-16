import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const data = await request.json();
  const order = await Order.findByIdAndUpdate(id, data, { new: true });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await dbConnect();
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ message: "Pedido excluído com sucesso" });
}
