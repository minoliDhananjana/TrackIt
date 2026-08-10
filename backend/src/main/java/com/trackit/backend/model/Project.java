package com.trackit.backend.model;

import com.trackit.backend.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Technology is required")
    private String technology;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Project status is required")
    private ProjectStatus status;

    private List<String> assignedInternIds = new ArrayList<>();

    public Project() {
    }

    public Project(
            String id,
            String name,
            String description,
            String technology,
            LocalDate deadline,
            ProjectStatus status,
            List<String> assignedInternIds
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.technology = technology;
        this.deadline = deadline;
        this.status = status;
        this.assignedInternIds = assignedInternIds;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public List<String> getAssignedInternIds() {
        return assignedInternIds;
    }

    public void setAssignedInternIds(List<String> assignedInternIds) {
        this.assignedInternIds = assignedInternIds;
    }
}