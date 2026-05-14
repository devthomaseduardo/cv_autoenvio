import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resumes.dto';
export declare class ResumesService {
    private prisma;
    private ai;
    private tailorQueue;
    constructor(prisma: PrismaService, ai: AiService, tailorQueue: Queue);
    create(dto: CreateResumeDto, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }>;
    findAll(userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }>;
    update(id: string, dto: UpdateResumeDto, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }>;
    remove(id: string, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }>;
    tailorForJob(resumeId: string, jobId: string, userId: string): Promise<{
        resume: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            content: import("@prisma/client/runtime/library").JsonValue;
            isBase: boolean;
            rawText: string | null;
            fileUrl: string | null;
            version: number;
        };
        coverLetter: string;
        technicalBrief: string;
        keyChanges: string[];
    }>;
    getBaseResume(userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        isBase: boolean;
        rawText: string | null;
        fileUrl: string | null;
        version: number;
    }>;
}
