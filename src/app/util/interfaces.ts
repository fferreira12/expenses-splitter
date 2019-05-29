import { PayersArray } from "./types";
import { User } from "../models/user.model";

export interface PaymentCalculator {
  calculate(balance: Object): { payer: User; receiver: User; amount: number }[];
}
