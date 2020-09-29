import { state } from '@angular/animations';
import { createReducer, on, props } from "@ngrx/store";
import copy from "fast-copy";
import { Project } from '../models/project.model';
import {
  createProject,
  getAllProjects,
  getCurrentProject,
  renameProject,
  deleteProject,
  archiveProject,
  setCurrentProject,
  unarchiveProject,
  loadProjects, setUser, addEditor, removeEditor
} from "./app.actions";
import { AppState } from './app.state';
import { ProjectState } from './project.state';

export const initialState: AppState = {
  isLoading: false,
  userId: null,
  userEmail: null,
  selfProjects: [
    new ProjectState()
  ],
  otherProjects: [],
  currentProject: null
};

const _projectReducer = createReducer<AppState>(
  initialState,

  on(createProject, (state, props) => {
    //let newState: AppState = copy(state);
    let p = new ProjectState();
    p.ownerId = state.userId;
    p.ownerEmail = state.userEmail;
    return {
      ...copy(state),
      selfProjects: [...state.selfProjects, p],
      currentProject: p
    }
  }),

  on(getAllProjects, (state) => {
    return state;
  }),

  on(loadProjects, (state, props) => {
    return {
      ...copy(state),
      selfProjects: props.projects
    }
  }),

  on(setUser, (state, props) => {
    return {
      ...copy(state),
      userId: props.userId,
      userEmail: props.userEmail
    }
  }),

  on(setCurrentProject, (state, props) => {
    let st: AppState = copy(state);
    let cps = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    // debugger;
    console.log('inside action reducer');

    return {
      ...st,
      currentProject: cps
    }
  }),

  on(renameProject, (state, props) => {
    let st: AppState = copy(state);
    let pToRename = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    pToRename.projectName = props.newName;
    return {
      ...st
    }
  }),

  on(archiveProject, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    p.archived = true;
    return {
      ...st
    }
  }),

  on(unarchiveProject, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    p.archived = false;
    return {
      ...st
    }
  }),

  on(deleteProject, (state, props) => {
    let st: AppState = copy(state);
    return {
      ...st,
      selfProjects: st.selfProjects.filter(p => p.projectId !== props.projectId)
    }
  }),

  on(addEditor, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    let s = new Set(p.editors);
    s.add(props.editorEmail);
    p.editors = Array.from(s);
    return {
      ...st
    }
  }),

  on(removeEditor, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    let s = new Set(p.editors);
    s.delete(props.editorEmail);
    p.editors = Array.from(s);
    return {
      ...st
    }
  })


);

export function projectReducer(state, action) {
  return _projectReducer(state, action);
}
