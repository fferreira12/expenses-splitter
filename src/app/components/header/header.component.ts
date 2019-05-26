import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { SplitterService } from "src/app/services/splitter.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  currentLoggedInAs: string;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.subscribeToUser(user => {
      if (user == null) {
        return;
      }
      this.currentLoggedInAs = user.email;
    });
  }
}
