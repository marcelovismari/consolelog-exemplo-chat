import {
  AfterViewInit,
  Component,
  ElementRef,
  Signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from './chat.service';
import { Mensagem } from './mensagem.type';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ChatComponent implements AfterViewInit {
  mensagens: Signal<Mensagem[]>;
  usuariosNoChat: Signal<string[]>;
  status: Signal<string>;
  inputMensagem =
    viewChild.required<ElementRef<HTMLInputElement>>(
      'inputMensagem'
    );

  formGroup = new FormGroup({
    inputMensagem: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get formGroupInputMensagem() {
    return this.formGroup.get('inputMensagem')!;
  }

  constructor(private chatService: ChatService) {
    this.mensagens = this.chatService.mensagens;
    this.status = this.chatService.status;
    this.usuariosNoChat = this.chatService.usuariosNoChat;
  }

  ngAfterViewInit(): void {
    this.focarInput();
  }

  focarInput() {
    this.inputMensagem().nativeElement.focus();
  }

  enviarMensagem() {
    if (this.formGroup.invalid) {
      return;
    }

    const id = crypto.randomUUID();
    const mensagem = this.formGroupInputMensagem.value;
    this.chatService.enviarMensagemTexto(mensagem, id);
    this.formGroupInputMensagem.reset();
    this.focarInput();
  }
}
