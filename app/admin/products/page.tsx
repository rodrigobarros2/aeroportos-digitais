"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  price: z.number().min(0, {
    message: "O preço deve ser um número positivo.",
  }),
  description: z.string().min(4, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      form.reset();
      fetchProducts();
      toast({
        title: "Product added",
        description: "Your new product has been added successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "There was an error adding the product.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchProducts();
      toast({
        title: "Produto deletado",
        description: "O produto foi deletado com sucesso.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erro",
        description: "Houve um erro ao deletar o produto.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });
    if (response.ok) {
      fetchProducts();
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Houve um erro ao atualizar o produto.",
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
        <h1 className="text-3xl font-bold mb-4">Gerenciar Produtos</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do produto" {...field} />
                  </FormControl>
                  <FormDescription>Este é o nome que será exibido para os clientes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Digite o preço"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Digite o preço em reais.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormDescription>Forneça uma breve descrição do produto.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Adicionar Produto</Button>
          </form>
        </Form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {products.map((product) => (
            <div key={product._id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p>{product.description}</p>
              <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
              <Button variant="destructive" onClick={() => deleteProduct(product._id)} className="mt-2 mr-2">
                Deletar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newName = prompt("Enter new name", product.name);
                  const newPrice = parseFloat(prompt("Enter new price", product.price.toString()) || "0");
                  const newDescription = prompt("Enter new description", product.description);
                  if (newName && newPrice && newDescription) {
                    updateProduct(product._id, { name: newName, price: newPrice, description: newDescription });
                  }
                }}
                className="mt-2"
              >
                Editar
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
