import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-card',
  templateUrl: './number-card.component.html',
  styleUrls: ['./number-card.component.css']
})
export class NumberCardComponent implements OnInit {

  @Input() title: string;
  @Input() value: string;
  @Input() iconClass: string;
  @Input() isCurrency: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
