import { Project } from './project.model';
import { User } from './user.model';
import { Expense } from './expense.model';

fdescribe('Project Model', () => {
  it('should allow uneven splits', () => {
    let p = new Project();
    console.log('shoul appear');
    
    let u1 = new User('u1', 'id1');
    let u2 = new User('u2', 'id2');

    p.addUser(u1);
    p.addUser(u2);

    p.setUnevenSplit([{
      user: u1,
      weight: 1
    },{
      user: u2,
      weight: 2
    }]);

    let e = new Expense('exp1', 90);
    e.addUser(u1);
    e.addUser(u2);
    e.setPayer(u1);
    
    p.addExpense(e);

    let fairShares = p.getFairShares();

    expect(p).toBeTruthy();
    expect(fairShares['id1']).toBe(30);
    expect(fairShares['id2']).toBe(60);
  });

});