import { User } from '../user.model';

export interface WeightedItem {
  users: User[];
  weights: {user: User, weight: number}[];
}
