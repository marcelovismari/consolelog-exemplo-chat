export type Mensagem = {
  id?: string;
  tipo: 'recebida' | 'enviada';
  status?: 'enviando' | 'enviado';
  remetente?: string;
  mensagem: string;
};
