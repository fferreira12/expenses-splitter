import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { SplitterService } from "src/app/services/splitter.service";
import { Project } from "src/app/models/project.model";
import { FormControl } from "@angular/forms";
import { Observable } from 'rxjs';

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
      this.splitterService.getArchivedProjects();
    }
  }

  get showArchivedProjects(): boolean {
    return this._showArchivedProjects;
  }

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.allProjects$ = this.splitterService.getAllProjects$();
    this.allProjects$.subscribe(allProjects => {
      this.allProjects = allProjects;
    });
    
    this.currentProject$ = this.splitterService.getCurrentProject$();
    this.currentProject$.subscribe(currProject => {
      this.currentProject = currProject;
    });
  }

  onActivateProject(project: Project) {
    //console.log('project to activate: ' + project.projectName);
    this.splitterService.setCurrentProject(project);
  }

  onDeleteProject(project: Project) {
    //console.log('project to delete: ' + project.projectName);
    this.splitterService.deleteProject(project);
  }

  onAddProject() {
    this.splitterService.createNewProject(this.projectName.value);
  }

  onRenameProject(project: Project) {
    //console.log('project to rename: ' + project.projectName);
    this.splitterService.renameProject(project, this.projectNewName.value);
  }

  onToggleInviteUser() {
    this.addingUser = !this.addingUser;
  }

  onInviteUser(project: Project, email: string) {
    this.splitterService.addEditor(project, email);

    this.addingUser = false;
  }

  onRemoveEditor(project: Project, email: string) {
    this.splitterService.removeEditor(project, email);
  }

  selfProject(project: Project) {
    return this.splitterService.isSelfProject(project);
  }

  isCurrentProject(project: Project) {
    if(!project) {
      return false;
    }
    return project.projectName == this.currentProject.projectName;
  }

  onArchiveProject(project: Project) {
    //console.log('archiving project', project);
    this.splitterService.archiveProject(project);
  }

  onUnarchiveProject(project: Project) {
    this.splitterService.unArchiveProject(project);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.allProjects, event.previousIndex, event.currentIndex);
    this.splitterService.setProjectsOrder(this.allProjects);
  }

}
