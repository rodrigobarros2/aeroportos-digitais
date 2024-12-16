"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

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

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!session) return;

    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const updatedOrders = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(updatedOrders);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [session]);

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      // Atualiza no MongoDB
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status in MongoDB");
      }

      // Atualiza no Firestore
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      toast({
        title: "Pedido atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erro",
        description: "Houve um erro ao atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    <div>Acesso negado. Por favor, faça login como administrador.</div>;
  }

  return (
    <div>
      <Navbar />
      <main className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Pedidos de Clientes</h1>
        <Table>
          <TableCaption>Uma lista dos pedidos recentes dos clientes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Portão</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order._id.slice(0, 8)}</TableCell>
                <TableCell>{order.userName}</TableCell>
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
                    className="w-24 justify-center"
                    variant={
                      order.status === "pending"
                        ? "default"
                        : order.status === "preparing"
                        ? "secondary"
                        : order.status === "ready"
                        ? "success"
                        : "destructive"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.gate}</TableCell>
                <TableCell>
                  <Button
                    className="w-36"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateOrderStatus(
                        order._id,
                        order.status === "pending"
                          ? "preparing"
                          : order.status === "preparing"
                          ? "ready"
                          : order.status === "ready"
                          ? "delivered"
                          : "delivered"
                      )
                    }
                    disabled={order.status === "delivered"}
                  >
                    {order.status === "pending"
                      ? "Iniciar Preparação"
                      : order.status === "preparing"
                      ? "Marcar como Pronto"
                      : order.status === "ready"
                      ? "Marcar como Entregue"
                      : "Entregue"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
