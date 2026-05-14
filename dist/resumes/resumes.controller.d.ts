import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resumes.dto';
declare class TailorDto {
    resumeId: string;
    jobId: string;
}
export declare class ResumesController {
    private readonly resumesService;
    constructor(resumesService: ResumesService);
    create(dto: CreateResumeDto, user: {
        id: string;
    }): Promise<{
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
    findAll(user: {
        id: string;
    }): Promise<{
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
    getBase(user: {
        id: string;
    }): Promise<{
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
    findOne(id: string, user: {
        id: string;
    }): Promise<{
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
    update(id: string, dto: UpdateResumeDto, user: {
        id: string;
    }): Promise<{
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
    remove(id: string, user: {
        id: string;
    }): Promise<{
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
    tailor(dto: TailorDto, user: {
        id: string;
    }): Promise<{
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
}
export {};
