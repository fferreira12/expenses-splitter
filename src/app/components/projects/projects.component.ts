import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { Project } from 'src/app/models/project.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projectName = new FormControl('');
  projectNewName = new FormControl('');

  allProjects: Project[];
  currentProject: Project;

  constructor(private splitterService: SplitterService) { }

  ngOnInit() {
    this.allProjects = this.splitterService.getAllProjects();
    this.currentProject = this.splitterService.getCurrentProject();

    this.splitterService.subscribeToAllProjects(allProjects => {
      this.allProjects = allProjects;
    });
    this.splitterService.subscribeToCurrentProject(currProject => {
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
    this.splitterService.renameProject(project, this.projectNewName.value)
  }

}
