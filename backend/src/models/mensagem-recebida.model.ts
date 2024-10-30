import {
  Transform,
  TransformFnParams,
  Type,
} from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum MensagemRecebidaTipo {
  MESSAGE = 'message',
  JOIN = 'join',
}

export abstract class MsgRecebidaBase {
  @IsEnum(MensagemRecebidaTipo)
  tipo!: MensagemRecebidaTipo;
}

export class MsgRecebidaTexto extends MsgRecebidaBase {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value?.trim()
  )
  mensagem!: string;
}

export class MsgRecebidaNovoUsuario extends MsgRecebidaBase {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value?.trim()
  )
  nomeUsuario!: string;
}

export class TratarMsgRecebida {
  @IsObject()
  @ValidateNested()
  @Type(() => MsgRecebidaBase, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'tipo',
      subTypes: [
        {
          value: MsgRecebidaTexto,
          name: MensagemRecebidaTipo.MESSAGE,
        },
        {
          value: MsgRecebidaNovoUsuario,
          name: MensagemRecebidaTipo.JOIN,
        },
      ],
    },
  })
  objMensagem!:
    | MsgRecebidaTexto
    | MsgRecebidaNovoUsuario;
}
