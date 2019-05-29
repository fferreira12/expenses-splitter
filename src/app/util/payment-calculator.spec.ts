import { SimpleCalculator } from "./payment-calculator";
import { User } from "../models/user.model";

fdescribe("Payment Calculator", () => {
  it("should see when it is done", () => {
    let calc = new SimpleCalculator();
    let done = calc.isDone({ abc: 0, def: 0 });
    expect(done).toBe(true);
  });
  it("should return the biggest negative", () => {
    let calc = new SimpleCalculator();
    let val = calc.biggestNegative({ abc: 0, def: -5 });
    expect(val.smallestId).toBe("def");
    expect(val.smallestValue).toBe(-5);
  });
  it("should return the biggest positive", () => {
    let calc = new SimpleCalculator();
    let val = calc.biggestPositive({ abc: 15, def: -5 });
    expect(val.biggestId).toBe("abc");
    expect(val.biggestValue).toBe(15);
  });
  it("should get user by id", () => {
    let calc = new SimpleCalculator();
    let user = new User("fernando", "abc");
    calc.setAllUsers([user]);
    let val = calc.getUserById("abc");
    expect(val.name).toBe("fernando");
    expect(val.id).toBe("abc");
  });

  it("should calculate the payments for the simple case", () => {
    let calc = new SimpleCalculator();
    calc.setAllUsers([new User("fernando", "a"), new User("mary", "b")]);
    let val = calc.calculate({ a: 15, b: -15 });
    expect(val.length).toBe(1);
    expect(val[0].amount).toBe(15);
    expect(val[0].payer.id).toBe("b");
    expect(val[0].payer.name).toBe("mary");
    expect(val[0].receiver.id).toBe("a");
    expect(val[0].receiver.name).toBe("fernando");
  });

  it("should calculate the payments for the complex case", () => {
    let calc = new SimpleCalculator();
    calc.setAllUsers([
      new User("adrian", "a"),
      new User("bernard", "b"),
      new User("chris", "c")
    ]);
    let val = calc.calculate({ a: 20, b: -15, c: -5 });
    expect(val.length).toBe(2);
    expect(val[0].amount).toBe(15);
    expect(val[0].payer.id).toBe("b");
    expect(val[0].payer.name).toBe("bernard");
    expect(val[0].receiver.id).toBe("a");
    expect(val[0].receiver.name).toBe("adrian");
    expect(val[1].amount).toBe(5);
    expect(val[1].payer.id).toBe("c");
    expect(val[1].payer.name).toBe("chris");
    expect(val[1].receiver.id).toBe("a");
    expect(val[1].receiver.name).toBe("adrian");
  });
});
