import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Project } from "src/app/models/project.model";
import { FormControl } from "@angular/forms";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { addEditor, archiveProject, createProject, deleteProject, orderProjects, removeEditor, renameProject, setCurrentProject, startLoadArchivedProjects, unarchiveProject } from 'src/app/state/app.actions';
import { selectCurrentProject, selectIsSelfProject, selectOrderedProjects } from 'src/app/state/app.selectors';

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.css"]
})
export class ProjectsComponent implements OnInit {
  projectName = new FormControl("");
  projectNewName = new FormControl("");
  addingUser: boolean = false;

  allProjects: Project[];
  allProjects$: Observable<Project[]>;
  currentProject: Project;
  currentProject$: Observable<Project>;

  _showArchivedProjects: boolean = false;

  set showArchivedProjects(val: boolean) {
    this._showArchivedProjects = val;
    if(val) {
      this.store.dispatch(startLoadArchivedProjects());
    }
  }

  get showArchivedProjects(): boolean {
    return this._showArchivedProjects;
  }

  constructor(private store: Store<{ projects: AppState }>) {}

  ngOnInit() {
    // this.allProjects$ = this.splitterService.getAllProjects$();
    this.allProjects$ = this.store.select(selectOrderedProjects);
    this.allProjects$.subscribe(allProjects => {
      this.allProjects = allProjects;
      // this.currentProject = this.allProjects[0];
    });

    this.currentProject$ = this.store.select(selectCurrentProject);
    // this.currentProject$ = this.splitterService.getCurrentProject$();

    this.currentProject$.subscribe(currProject => {
      this.currentProject = currProject;
    });

  }

  onActivateProject(project: Project) {
    //console.log('project to activate: ' + project.projectName);
    //this.splitterService.setCurrentProject(project);
    this.store.dispatch(setCurrentProject({ projectId: project.projectId }));
  }

  onDeleteProject(project: Project) {
    //console.log('project to delete: ' + project.projectName);
    //this.splitterService.deleteProject(project);
    this.store.dispatch(deleteProject({ projectId: project.projectId }));
  }

  onAddProject() {
    //this.splitterService.createNewProject(this.projectName.value);
    this.store.dispatch(createProject({projectName: this.projectName.value}));
  }

  onRenameProject(project: Project) {
    //console.log('project to rename: ' + project.projectName);
    //this.splitterService.renameProject(project, this.projectNewName.value);
    this.store.dispatch(renameProject({ projectId: project.projectId, newName: this.projectNewName.value }));
  }

  onToggleInviteUser() {
    this.addingUser = !this.addingUser;
  }

  onInviteUser(project: Project, email: string) {
    this.store.dispatch(addEditor({ projectId: project.projectId, editorEmail: email }));

    this.addingUser = false;
  }

  onRemoveEditor(project: Project, email: string) {
    this.store.dispatch(removeEditor({ projectId: project.projectId, editorEmail: email }));

  }

  selfProject(project: Project) {
    return this.store.select(selectIsSelfProject, project);
  }

  isCurrentProject(project: Project) {
    if(!project || !this.currentProject) {
      return false;
    }
    return project.projectId == this.currentProject.projectId;
  }

  onArchiveProject(project: Project) {
    this.store.dispatch(archiveProject({ projectId: project.projectId }));
  }

  onUnarchiveProject(project: Project) {
    this.store.dispatch(unarchiveProject({ projectId: project.projectId }));
  }

  drop(event: CdkDragDrop<string[]>) {
    let projects = this._showArchivedProjects ? this.allProjects : this.allProjects.filter(p => !p.archived);
    moveItemInArray(projects, event.previousIndex, event.currentIndex);
    this.store.dispatch(orderProjects({ projects }));
  }

}
