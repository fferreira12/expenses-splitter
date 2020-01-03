import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

export const expenseTotalCalculator = functions.firestore
  .document('projects2/{projectId}')
  .onWrite((change, context) => {
    let expenses = change.after.get('expenses') as any[];
    let total = 0;
    expenses.forEach(expense => {
      total += expense.value;
    });
    let pId = context.params['projectId'];
    let projectRef = db.collection('projects2').doc(pId);
    projectRef.update({ total });
  })