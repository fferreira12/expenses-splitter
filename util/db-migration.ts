//import { Project } from "../app/models/project.model";

import * as admin from 'firebase-admin';
//const admin = require('firebase-admin');
//import * as serviceAccount from './testproject-228310-fc20aad2cb67.json';
let serviceAccount = require('./service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

let projectsRef = db.collection('projects');

projectsRef.get().then(querySnapshot => {
  let docSnapshots = querySnapshot.docs;
  let data: any[] = [];
  docSnapshots.forEach(snap => {
    data.push(snap.data());
  })

  data.forEach(data => {
    console.log('saving project ', data.projectId)
    saveProject(getProjectFromData(data));
  })
  
})

function getProjectFromData(data: any) {
  let parsedData = JSON.parse(data.data);
  //let project: Project = new Project();
  console.log({parsedData});

  return parsedData;
}

function saveProject(project: any) {
  let docRef = db.collection('projects2').doc(project.projectId);

  let setAda = docRef.set({
    ...project
  });

}