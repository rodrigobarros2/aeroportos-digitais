export interface Item {
  _id?: string;
  nome: string;
  descricao?: string;
  status: "ativo" | "inativo";
}
