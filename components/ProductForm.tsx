"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Item } from "@/types/item";

interface ProductProps {
  onSubmit: SubmitHandler<Item>;
  initialData?: Item;
}

export default function ProductForm({
  onSubmit,
  initialData = { nome: "", descricao: "", status: "ativo" },
}: ProductProps) {
  const { register, handleSubmit, reset } = useForm<Item>({
    defaultValues: initialData,
  });

  const submitHandler: SubmitHandler<Item> = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <div className="mb-4">
        <label className="block mb-2">Nome</label>
        <input {...register("nome", { required: true })} className="w-full p-2 border rounded" placeholder="Nome" />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Descrição</label>
        <textarea {...register("descricao")} className="w-full p-2 border rounded" placeholder="Descrição" />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Status</label>
        <select {...register("status")} className="w-full p-2 border rounded">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        {initialData._id ? "Atualizar" : "Criar"}
      </button>
    </form>
  );
}
