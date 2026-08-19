package com.trackit.backend.repository;

import com.trackit.backend.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByAssignedInternIdsContaining(String internId);
}
