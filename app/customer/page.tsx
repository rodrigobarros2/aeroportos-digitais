"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

const orderFormSchema = z.object({
  gate: z.string().min(1, {
    message: "Por favor, insira o número do seu portão.",
  }),
});

export default function CustomerPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      gate: "",
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch("/api/products");
    const productsData = await response.json();
    setProducts(productsData);
  };

  const addToCart = (productId: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p._id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const onSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Carrinho está vazio",
        description: "Por favor, adicione itens ao seu carrinho antes de fazer um pedido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = {
        userId: session?.user?.email,
        userName: session?.user?.name,
        items: Object.entries(cart).map(([productId, quantity]) => {
          const product = products.find((p) => p._id === productId);
          return {
            productId,
            name: product?.name || "",
            quantity,
            price: product?.price || 0,
          };
        }),
        total: getTotalPrice(),
        status: "pending",
        gate: values.gate,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar pedido");
      }

      setCart({});
      form.reset();
      toast({
        title: "Pedido realizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return <div>Por favor, faça login para ver o menu e fazer pedidos.</div>;
  }

  return (
    <div>
      <main className="container mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Menu</h1>
          <Link href="/customer/orders">
            <Button variant="outline">Ver Seus Pedidos</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product._id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-bold">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => addToCart(product._id)}>Adicionar ao Carrinho</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Seu Carrinho</h2>
        {Object.keys(cart).length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div>
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find((p) => p._id === productId);
              return (
                <div key={productId} className="flex justify-between items-center mb-2">
                  <span>
                    {product?.name} x {quantity}
                  </span>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => removeFromCart(productId)} className="mr-2">
                      -
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addToCart(productId)}>
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
            <p className="font-bold mt-4">Total: ${getTotalPrice().toFixed(2)}</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
                <FormField
                  control={form.control}
                  name="gate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Portão</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira o número do seu portão" {...field} />
                      </FormControl>
                      <FormDescription>
                        Por favor, insira o número do portão de desembarque onde gostaria que seu pedido fosse entregue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Fazer Pedido</Button>
              </form>
            </Form>
          </div>
        )}
      </main>
    </div>
  );
}
