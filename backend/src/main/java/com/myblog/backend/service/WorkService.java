package com.myblog.backend.service;

import com.myblog.backend.common.BusinessException;
import com.myblog.backend.dto.WorkDto;
import com.myblog.backend.model.Work;
import com.myblog.backend.repository.WorkRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 作品业务逻辑服务
 */
@Service
public class WorkService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final WorkRepository workRepository;

    public WorkService(WorkRepository workRepository) {
        this.workRepository = workRepository;
    }

    public List<Work> listWorks() {
        return workRepository.findAll();
    }

    public Work getWorkById(Long id) {
        return workRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "作品不存在"));
    }

    public Work createWork(WorkDto dto) {
        String now = LocalDateTime.now().format(FMT);
        Work work = new Work();
        work.setTitle(dto.getTitle());
        work.setDescription(dto.getDescription());
        work.setCoverUrl(dto.getCoverUrl());
        work.setDemoUrl(dto.getDemoUrl());
        work.setGithubUrl(dto.getGithubUrl());
        work.setTechStack(dto.getTechStack() != null ? dto.getTechStack() : new ArrayList<>());
        work.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        work.setCreatedAt(now);

        return workRepository.save(work);
    }

    public Work updateWork(Long id, WorkDto dto) {
        Work existing = workRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "作品不存在"));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setCoverUrl(dto.getCoverUrl());
        existing.setDemoUrl(dto.getDemoUrl());
        existing.setGithubUrl(dto.getGithubUrl());
        if (dto.getTechStack() != null) {
            existing.setTechStack(dto.getTechStack());
        }
        if (dto.getSortOrder() != null) {
            existing.setSortOrder(dto.getSortOrder());
        }

        return workRepository.save(existing);
    }

    public void deleteWork(Long id) {
        boolean ok = workRepository.deleteById(id);
        if (!ok) {
            throw new BusinessException(404, "要删除的作品不存在");
        }
    }
}
