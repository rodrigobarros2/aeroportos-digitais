"use client";

import Navbar from "@/components/Navbar";
import CustomerPage from "./customer/page";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div>
      <Navbar />
      <main className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Delivery de Aeroporto</h1>
        <p className="text-xl">Peça comida e bebidas diretamente para o seu portão!</p>
        {session ? (
          <>
            <h1 className="text-xl mt-6">Olá, {session.user?.name}! Faça seu pedido abaixo:</h1>
            <div>
              <CustomerPage />
            </div>
          </>
        ) : (
          <div className="mt-6">Por favor, faça login para ver o menu e fazer pedidos.</div>
        )}
      </main>
    </div>
  );
}
