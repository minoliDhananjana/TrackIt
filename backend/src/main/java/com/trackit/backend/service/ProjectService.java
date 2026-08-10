package com.trackit.backend.service;

import com.trackit.backend.model.Project;
import com.trackit.backend.repository.ProjectRepository;
import com.trackit.backend.model.User;
import com.trackit.backend.repository.UserRepository;
import com.trackit.backend.enums.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Project createProject(Project project) {
        validateAssignedInterns(project);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getVisibleProjects(User user, boolean supervisor) {
        return supervisor ? projectRepository.findAll() : projectRepository.findByAssignedInternIdsContaining(user.getId());
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElse(null);
    }

    public Project getVisibleProjectById(String id, User user, boolean supervisor) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Project not found"));
        if (!supervisor && (project.getAssignedInternIds() == null
                || !project.getAssignedInternIds().contains(user.getId()))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view projects assigned to you"
            );
        }
        return project;
    }

    public Project updateProject(String id, Project updatedProject) {

        Project existingProject = projectRepository.findById(id).orElse(null);

        if (existingProject == null) {
            return null;
        }

        validateAssignedInterns(updatedProject);

        existingProject.setName(updatedProject.getName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setTechnology(updatedProject.getTechnology());
        existingProject.setDeadline(updatedProject.getDeadline());
        existingProject.setStatus(updatedProject.getStatus());
        existingProject.setAssignedInternIds(updatedProject.getAssignedInternIds());

        return projectRepository.save(existingProject);
    }

    private void validateAssignedInterns(Project project) {
        if (project.getAssignedInternIds() == null) {
            project.setAssignedInternIds(List.of());
            return;
        }
        for (String internId : project.getAssignedInternIds().stream().distinct().toList()) {
            User intern = userRepository.findById(internId)
                    .orElseThrow(() -> new IllegalArgumentException("An assigned intern does not exist"));
            if (intern.getRole() != Role.INTERN || !intern.isActive()) {
                throw new IllegalArgumentException("Projects can only be assigned to active interns");
            }
        }
        project.setAssignedInternIds(project.getAssignedInternIds().stream().distinct().toList());
    }
}
