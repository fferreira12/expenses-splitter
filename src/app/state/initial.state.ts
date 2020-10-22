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
  currentProject: null,
  projectsOrder: {}
};
