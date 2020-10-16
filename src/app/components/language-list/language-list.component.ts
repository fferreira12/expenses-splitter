import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Firebasev2Service } from 'src/app/services/firebasev2.service';


@Component({
  selector: "app-language-list",
  templateUrl: "./language-list.component.html",
  styleUrls: ["./language-list.component.css"]
})
export class LanguageListComponent implements OnInit {
  currentLang: string = "EN";
  @Output() language = new EventEmitter<string>();

  constructor(private translate: TranslateService) {
    translate.setDefaultLang("en");

  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(languageData => {
      this.currentLang = languageData.lang.toUpperCase();
    })
  }

  onChangeLanguage(lang: string) {
    this.currentLang = lang;
    //this.translate.use(this.currentLang);
    this.language.emit(lang);
  }
}
