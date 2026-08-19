package com.trackit.backend.controller;

import com.trackit.backend.model.Task;
import com.trackit.backend.model.User;
import com.trackit.backend.dto.TaskProgressRequest;
import com.trackit.backend.service.CurrentUserService;
import com.trackit.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    public TaskController(TaskService taskService, CurrentUserService currentUserService) {
        this.taskService = taskService;
        this.currentUserService = currentUserService;
    }

    // Create a new task
    @PostMapping
    public Task createTask(@Valid @RequestBody Task task) {
        return taskService.createTask(task);
    }

    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        User user = currentUserService.requireCurrentUser();
        return taskService.getVisibleTasks(user.getId(), currentUserService.isSupervisor(user));
    }

    // Get a task by ID
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable String id) {
        User user = currentUserService.requireCurrentUser();
        return taskService.getVisibleTaskById(id, user.getId(), currentUserService.isSupervisor(user));
    }

    // Update a task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @Valid @RequestBody Task task) {
        Task updated = taskService.updateTask(id, task);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Task> updateProgress(
            @PathVariable String id,
            @Valid @RequestBody TaskProgressRequest request
    ) {
        User user = currentUserService.requireCurrentUser();
        Task updated = taskService.updateInternProgress(id, user.getId(), request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}