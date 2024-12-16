// filepath: /c:/Users/rodri/Documents/GitHub/aeroportos-digitais/app/api/orders/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Order } from "@/lib/models/Order";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const newOrder = await Order.create(data);

    await setDoc(doc(db, "orders", newOrder._id.toString()), {
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return new NextResponse("Erro ao criar pedido", { status: 500 });
  }
}
