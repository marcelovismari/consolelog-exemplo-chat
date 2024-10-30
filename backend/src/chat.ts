import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { WebSocket } from 'ws';
import {
  MsgRecebidaNovoUsuario,
  MsgRecebidaTexto,
  TratarMsgRecebida,
} from './models/mensagem-recebida.model';
import {
  MsgSaidaConfirmacaoRecebimento,
  MsgSaidaTexto,
  MsgSaidaListaUsuarios,
  MsgSaidaNovoUsuario,
  MsgSaida,
  MsgSaidaUsuarioSaiu,
} from './models/mensagem-saida.model';
import { Usuario } from './types/usuario.type';

export class Chat {
  conexoes = new Map<WebSocket, Usuario>();

  adicionarConexao(conexao: WebSocket) {
    // Assim que o usuário se conecta, o servidor adiciona
    // o usuário na lista de conexões com o nome
    // desconhecido. Depois esse nome é atualizado.
    this.conexoes.set(conexao, { nome: 'desconhecido' });

    // Quando o usuário envia uma mensagem para o servidor,
    // a mensagem e a processa logo abaixo:
    conexao.on('message', async (buffer) => {
      try {
        // Converte a mensagem recebida para um objeto JSON
        // e depois para a classe TratarMensagemRecebida
        const objRecebido: any = JSON.parse(
          buffer.toString('utf-8')
        );

        const mensagemRecebida = plainToClass(
          TratarMsgRecebida,
          objRecebido
        );

        // Faz a validação dos dados recebidos
        await validateOrReject(mensagemRecebida);
        const body = mensagemRecebida.objMensagem;

        // ************************************************
        // Processa as mensagens do tipo texto, ou seja,
        // mensagens de texto enviadas pelos usuários
        // ************************************************
        if (body instanceof MsgRecebidaTexto) {
          // Simula um atraso de 1 segundo
          await this.delay(1000);

          const enviarMensagemTexto = new MsgSaidaTexto(
            body.id,
            this.conexoes.get(conexao)?.nome ||
              'desconhecido',
            body.mensagem
          );
          this.enviarMensagemParaTodos(
            enviarMensagemTexto,
            conexao
          );

          // Envia a mensagem para o próprio usuário
          // confirmando que a mensagem foi recebida
          const msg = new MsgSaidaConfirmacaoRecebimento(
            body.id
          );
          this.enviarMensagem(conexao, msg);
          return;
        }

        // ************************************************
        // Processa as mensagens do tipo JOIN, ou seja,
        // mensagens que o frontend envia para informar o
        // nome do usuário que acabou de se conectar
        // ************************************************
        if (body instanceof MsgRecebidaNovoUsuario) {
          // Atualiza o nome do usuário na lista de conexões
          this.conexoes.set(conexao, {
            nome: body.nomeUsuario,
          });

          // Envia a mensagem para todos os usuários,
          // indicando que um novo usuário se conectou
          const msg = new MsgSaidaNovoUsuario(
            body.nomeUsuario
          );
          this.enviarMensagemParaTodos(msg, conexao);

          // Envia a lista de usuários conectados p/frontend
          this.enviarListaUsuarios();
          return;
        }
      } catch (error) {
        console.error(
          'Mensagem não está no formato esperado',
          error
        );
      }
    });

    // Quando o usuário desconecta do chat, o servidor
    // envia uma mensagem para todos os usuários
    // conectados, indicando que o usuário desconectou
    conexao.on('close', () => {
      const enviarMensagemUsuarioSaiu =
        new MsgSaidaUsuarioSaiu(
          this.conexoes.get(conexao)?.nome || 'desconhecido'
        );

      this.conexoes.delete(conexao);
      this.enviarMensagemParaTodos(
        enviarMensagemUsuarioSaiu,
        conexao
      );
      this.enviarListaUsuarios();
    });
  }

  /**
   * Envia uma mensagem para todos os usuários conectados,
   * exceto para o usuário que enviou a mensagem.
   *
   * @param mensagem Mensagem a ser enviada
   * @param remetente Usuário que enviou a mensagem. Se
   * não for informado, a mensagem será enviada para
   * todos os usuários
   */
  enviarMensagemParaTodos(
    mensagem: MsgSaida,
    remetente: WebSocket | null = null
  ) {
    this.conexoes.forEach((_usuario, webSocket) => {
      if (webSocket === remetente) {
        return;
      }

      this.enviarMensagem(webSocket, mensagem);
    });
  }

  /**
   * Envia uma mensagem para um usuário específico
   *
   * @param destinatario Usuário destinatário da mensagem
   * @param mensagem Mensagem a ser enviada
   */
  enviarMensagem(
    destinatario: WebSocket,
    mensagem: MsgSaida
  ) {
    destinatario.send(JSON.stringify(mensagem));
  }

  /**
   * Envia a lista de usuários conectados para todos
   * os usuários conectados
   */
  enviarListaUsuarios() {
    const enviarMensagemListaUsuarios =
      new MsgSaidaListaUsuarios(
        Array.from(this.conexoes.values()).map(
          (usuario) => usuario.nome
        )
      );

    this.enviarMensagemParaTodos(
      enviarMensagemListaUsuarios
    );
  }

  delay(ms: number) {
    return new Promise((resolve) =>
      setTimeout(resolve, ms)
    );
  }
}
