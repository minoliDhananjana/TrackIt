package com.trackit.backend.repository;

import com.trackit.backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedInternId(String internId);
}
