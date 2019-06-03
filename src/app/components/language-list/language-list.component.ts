import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-language-list",
  templateUrl: "./language-list.component.html",
  styleUrls: ["./language-list.component.css"]
})
export class LanguageListComponent implements OnInit {
  currentLang: string = "EN";

  constructor(private translate: TranslateService) {
    translate.setDefaultLang("en");
  }

  ngOnInit() {}

  onChangeLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(this.currentLang);
  }
}
