import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  template: '<router-outlet></router-outlet>',
})

export class AppComponent {
  title = 'angular';
  compteurParent = 1;
  isVisible = false;
  majCompteur(event: number) {
    this.compteurParent += event;
    console.log(this.compteurParent);
  }
  submit() {
    this.isVisible = true;
    console.log("submit");
  }
}
