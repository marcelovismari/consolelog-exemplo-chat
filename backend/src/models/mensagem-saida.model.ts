export enum MensagemSaidaTipo {
  MESSAGE = 'message',
  CONFIRMATION_RECEIPT = 'confirmacao-recebimento',
  JOIN = 'join',
  LEAVE = 'leave',
  USERS = 'users',
}

export class MsgSaida {
  constructor(public readonly tipo: MensagemSaidaTipo) {}
}

export class MsgSaidaTexto extends MsgSaida {
  constructor(
    public readonly id: string,
    public readonly remetente: string,
    public readonly mensagem: string
  ) {
    super(MensagemSaidaTipo.MESSAGE);
  }
}

export class MsgSaidaConfirmacaoRecebimento extends MsgSaida {
  constructor(public readonly id: string) {
    super(MensagemSaidaTipo.CONFIRMATION_RECEIPT);
  }
}

export class MsgSaidaNovoUsuario extends MsgSaida {
  constructor(public readonly nomeUsuario: string) {
    super(MensagemSaidaTipo.JOIN);
  }
}

export class MsgSaidaUsuarioSaiu extends MsgSaida {
  constructor(public readonly nomeUsuario: string) {
    super(MensagemSaidaTipo.LEAVE);
  }
}

export class MsgSaidaListaUsuarios extends MsgSaida {
  constructor(public readonly usuarios: string[]) {
    super(MensagemSaidaTipo.USERS);
  }
}
