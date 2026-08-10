package com.trackit.backend.controller;

import com.trackit.backend.model.Project;
import com.trackit.backend.service.ProjectService;
import com.trackit.backend.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class ProjectController {

    private final ProjectService projectService;
    private final CurrentUserService currentUserService;

    public ProjectController(ProjectService projectService, CurrentUserService currentUserService) {
        this.projectService = projectService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @Valid @RequestBody Project project
    ) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(projectService.getVisibleProjects(user, currentUserService.isSupervisor(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @PathVariable String id
    ) {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(projectService.getVisibleProjectById(
                id, user, currentUserService.isSupervisor(user)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable String id,
            @Valid @RequestBody Project project
    ) {
        Project updatedProject = projectService.updateProject(id, project);

        if (updatedProject == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedProject);
    }
}
