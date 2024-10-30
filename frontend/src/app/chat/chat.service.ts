import { Injectable, signal } from '@angular/core';
import { Mensagem } from './mensagem.type';

@Injectable({ providedIn: 'root' })
export class ChatService {
  conexao: WebSocket | null = null;
  status = signal<string>('desconectado');
  mensagens = signal<Mensagem[]>([]);
  usuariosNoChat = signal<string[]>([]);

  abrirConexao(nome: string) {
    this.status.set('conectando');
    this.conexao = new WebSocket(`ws://localhost:8080`);

    this.conexao.onopen = () => {
      this.status.set('conectado');
      this.enviarMensagemJoin(nome);
    };

    this.conexao.onmessage = (event) => {
      this.tratarMensagensRecebidas(event);
    };

    this.conexao.onclose = () => {
      this.status.set('desconectado');
    };
  }

  enviarMensagemTexto(mensagem: string, id: string) {
    this.mensagens.update((mensagens) => [
      ...mensagens,
      {
        mensagem,
        id,
        tipo: 'enviada',
        status: 'enviando',
      },
    ]);

    const payload = { tipo: 'message', mensagem, id };
    this.enviarMensagem(payload);
  }

  private enviarMensagemJoin(nomeUsuario: string) {
    const payload = { tipo: 'join', nomeUsuario };
    this.enviarMensagem(payload);
  }

  private enviarMensagem(payload: any) {
    const dados = JSON.stringify({ objMensagem: payload });
    this.conexao!.send(dados);
  }

  /**
   * Trata as mensagens recebidas do WebSocket
   * @param event Evento de mensagem recebida
   */
  private tratarMensagensRecebidas(event: MessageEvent) {
    const objMensagem = JSON.parse(event.data);

    if (objMensagem.tipo === 'message') {
      const tipo = 'recebida';
      const { remetente, mensagem } = objMensagem;

      this.mensagens.update((mensagens) => [
        ...mensagens,
        { remetente, mensagem, tipo },
      ]);
      return;
    }

    if (objMensagem.tipo === 'confirmacao-recebimento') {
      const status = 'enviado';
      const { id } = objMensagem;

      this.mensagens.update((mensagens) =>
        mensagens.map((mensagem) =>
          mensagem.id === id
            ? { ...mensagem, status }
            : mensagem
        )
      );
      return;
    }

    if (objMensagem.tipo === 'users') {
      const { usuarios } = objMensagem;
      this.usuariosNoChat.set(usuarios);
      return;
    }

    if (objMensagem.tipo === 'join') {
      const tipo = 'recebida';
      const mensagem = 'Entrou no chat.';
      const { nomeUsuario } = objMensagem;

      this.mensagens.update((mensagens) => [
        ...mensagens,
        {
          remetente: nomeUsuario,
          mensagem,
          tipo,
        },
      ]);
      return;
    }

    if (objMensagem.tipo === 'leave') {
      const tipo = 'recebida';
      const mensagem = 'Saiu no chat.';
      const { nomeUsuario } = objMensagem;

      this.mensagens.update((mensagens) => [
        ...mensagens,
        {
          remetente: nomeUsuario,
          mensagem,
          tipo,
        },
      ]);
      return;
    }
  }
}
