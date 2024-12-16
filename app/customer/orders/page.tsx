"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Order {
  _id: string;
  userId: string;
  userName: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered";
  gate: string;
  createdAt: string;
}

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", session.user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const updatedOrders = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(updatedOrders);
    });

    return () => unsubscribe();
  }, [session]);

  if (!session) {
    <div>Por favor, faça login para ver seus pedidos.</div>;
  }

  return (
    <div>
      <main className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Seus Pedidos</h1>
        {orders.length === 0 ? (
          <p>Você ainda não fez nenhum pedido.</p>
        ) : (
          <Table>
            <TableCaption>Uma lista dos seus pedidos recentes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Portão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order._id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "pending"
                          ? "default"
                          : order.status === "preparing"
                          ? "secondary"
                          : order.status === "ready"
                          ? "outline"
                          : "success"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.gate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
