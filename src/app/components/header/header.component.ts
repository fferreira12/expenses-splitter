import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  currentLoggedInAs: string;
  @Output() language = new EventEmitter<string>();

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.subscribeToUser(user => {
      if (user == null) {
        return;
      }
      this.currentLoggedInAs = user.email;
    });
  }

  onChangeLanguage(lang: string) {
    this.language.emit(lang);
  }
}
