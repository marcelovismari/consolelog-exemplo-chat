import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatService } from './chat/chat.service';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ChatComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  mostrarFormularioEntrar = signal(true);

  formGroup = new FormGroup({
    nome: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  constructor(private chatService: ChatService) {}

  entrar() {
    if (this.formGroup.invalid) {
      return;
    }

    const nome = this.formGroup.get('nome')!.value!;
    this.mostrarFormularioEntrar.set(false);
    this.chatService.abrirConexao(nome);
  }
}
