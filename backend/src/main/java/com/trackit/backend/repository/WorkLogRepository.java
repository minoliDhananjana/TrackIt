package com.trackit.backend.repository;

import com.trackit.backend.model.WorkLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface WorkLogRepository extends MongoRepository<WorkLog, String> {

    List<WorkLog> findByInternId(String internId);

    boolean existsByInternIdAndDate(String internId, LocalDate date);
}
