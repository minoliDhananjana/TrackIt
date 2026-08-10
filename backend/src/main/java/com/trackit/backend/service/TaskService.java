package com.trackit.backend.service;

import com.trackit.backend.model.Task;
import com.trackit.backend.dto.TaskProgressRequest;
import com.trackit.backend.repository.TaskRepository;
import com.trackit.backend.repository.ProjectRepository;
import com.trackit.backend.repository.UserRepository;
import com.trackit.backend.model.Project;
import com.trackit.backend.model.User;
import com.trackit.backend.enums.Role;
import com.trackit.backend.enums.Status;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Task createTask(Task task) {
        validateAssignment(task);
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getVisibleTasks(String userId, boolean supervisor) {
        return supervisor ? taskRepository.findAll() : taskRepository.findByAssignedInternId(userId);
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id).orElse(null);
    }

    public Task getVisibleTaskById(String id, String userId, boolean supervisor) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Task not found"));
        if (!supervisor && !userId.equals(task.getAssignedInternId())) {
            throw new AccessDeniedException("You can only view tasks assigned to you");
        }
        return task;
    }

    public Task updateTask(String id, Task updatedTask) {

        Task existingTask = taskRepository.findById(id).orElse(null);

        if (existingTask == null) {
            return null;
        }

        validateAssignment(updatedTask);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setProjectId(updatedTask.getProjectId());
        existingTask.setAssignedInternId(updatedTask.getAssignedInternId());
        existingTask.setDeadline(updatedTask.getDeadline());
        existingTask.setProgress(updatedTask.getProgress());

        return taskRepository.save(existingTask);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }

    public Task updateInternProgress(String id, String internId, TaskProgressRequest request) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null || !internId.equals(task.getAssignedInternId())) return null;
        if (request.getStatus() != Status.TODO && request.getStatus() != Status.IN_PROGRESS) {
            throw new IllegalArgumentException("Interns can only move tasks between TODO and IN_PROGRESS; submit work for review to continue the workflow");
        }
        if (task.getStatus() == Status.SUBMITTED || task.getStatus() == Status.COMPLETED) {
            throw new IllegalArgumentException("This task is awaiting review or already completed");
        }
        task.setStatus(request.getStatus());
        task.setProgress(request.getProgress());
        return taskRepository.save(task);
    }

    private void validateAssignment(Task task) {
        Project project = projectRepository.findById(task.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Selected project does not exist"));
        User intern = userRepository.findById(task.getAssignedInternId())
                .orElseThrow(() -> new IllegalArgumentException("Selected intern does not exist"));
        if (intern.getRole() != Role.INTERN || !intern.isActive()) {
            throw new IllegalArgumentException("Tasks can only be assigned to an active intern");
        }
        if (project.getAssignedInternIds() == null || !project.getAssignedInternIds().contains(intern.getId())) {
            throw new IllegalArgumentException("The selected intern must be assigned to the project first");
        }
    }
}
