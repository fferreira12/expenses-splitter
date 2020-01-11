import { uuid } from '../util/uuid';

export class User {
  id: string;
  name: string;

  order: number;

  constructor(name: string, id?: string) {
    this.name = name;
    if (id != undefined) {
      this.id = id;
    } else {
      this.id = uuid();
    }
  }
}
