import { User } from './user.model';

export class Payment {

  payer: User;
  receiver: User;
  value: number;

  fileUrl: string;
  filePath: string;

  order: number;

  constructor(payer: User, receiver: User, value:number){
    this.payer = payer;
    this.receiver = receiver;
    this.value = value;
  }

}