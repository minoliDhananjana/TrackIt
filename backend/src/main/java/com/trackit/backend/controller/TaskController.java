package com.trackit.backend.controller;

import com.trackit.backend.model.Task;
import com.trackit.backend.service.TaskService;
import com.trackit.backend.service.CurrentUserService;
import com.trackit.backend.dto.TaskProgressRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class TaskController {

    @Autowired
    private TaskService taskService;
    @Autowired
    private CurrentUserService currentUserService;

    // Create a new task
    @PostMapping
    public Task createTask(@Valid @RequestBody Task task) {
        return taskService.createTask(task);
}

    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        var user = currentUserService.requireCurrentUser();
        return taskService.getVisibleTasks(user.getId(), currentUserService.isSupervisor(user));
    }
    // Get a task by ID
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable String id) {
        var user = currentUserService.requireCurrentUser();
        return taskService.getVisibleTaskById(id, user.getId(), currentUserService.isSupervisor(user));
    }
    // Update a task
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id, @Valid @RequestBody Task task) {
        return taskService.updateTask(id, task);
}

    @PutMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable String id, @Valid @RequestBody TaskProgressRequest request) {
        var user = currentUserService.requireCurrentUser();
        Task updated = taskService.updateInternProgress(id, user.getId(), request);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
    // Delete a task
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable String id) {
     taskService.deleteTask(id);
        return "Task deleted successfully!";
}
}
