//import { Project } from "../app/models/project.model";

//import * as admin from 'firebase-admin';
const admin = require('firebase-admin');
//import * as serviceAccount from './testproject-228310-fc20aad2cb67.json';
let serviceAccount = require('./service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

let projectsRef = db.collection('projects2');

projectsRef.get().then(querySnapshot => {
  let docSnapshots = querySnapshot.docs;
  let data = [];
  docSnapshots.forEach(async snap => {
    let data = snap.data();
    console.log(data);
    if (data.ownerEmail == "fferreira12@gmail.com" && data.projectName == 'Default') {
      await snap.ref.delete();
    }
  })
})

