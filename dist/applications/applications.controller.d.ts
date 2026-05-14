import { ApplicationsService } from './applications.service';
declare class CreateAppDto {
    jobId: string;
    resumeId?: string;
    notes?: string;
}
declare class UpdateStatusDto {
    status: string;
}
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(dto: CreateAppDto, user: {
        id: string;
    }): Promise<{
        application: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            jobId: string;
            notes: string | null;
            resumeId: string | null;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            tailoredResume: import("@prisma/client/runtime/library").JsonValue | null;
            coverLetter: string | null;
            technicalBrief: string | null;
            appliedAt: Date | null;
        };
        message: string;
    }>;
    findAll(user: {
        id: string;
    }): Promise<({
        resume: {
            title: string;
        };
        job: {
            title: string;
            location: string;
            company: string;
            workMode: string;
        };
        events: {
            description: string | null;
            type: string;
            id: string;
            applicationId: string;
            occurredAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobId: string;
        notes: string | null;
        resumeId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        tailoredResume: import("@prisma/client/runtime/library").JsonValue | null;
        coverLetter: string | null;
        technicalBrief: string | null;
        appliedAt: Date | null;
    })[]>;
    getStats(user: {
        id: string;
    }): Promise<{
        total: number;
        byStatus: Record<string, number>;
        averageMatchScore: number;
    }>;
    findOne(id: string, user: {
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
        job: {
            description: string;
            title: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            location: string | null;
            externalId: string | null;
            sourceUrl: string;
            source: string;
            company: string;
            workMode: string | null;
            contractType: string | null;
            salaryMin: number | null;
            salaryMax: number | null;
            requirements: string | null;
            benefits: string | null;
            requiredSkills: string[];
            niceToHave: string[];
            seniority: string | null;
            postedAt: Date | null;
            expiresAt: Date | null;
            scrapedAt: Date;
        };
        events: {
            description: string | null;
            type: string;
            id: string;
            applicationId: string;
            occurredAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobId: string;
        notes: string | null;
        resumeId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        tailoredResume: import("@prisma/client/runtime/library").JsonValue | null;
        coverLetter: string | null;
        technicalBrief: string | null;
        appliedAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto, user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobId: string;
        notes: string | null;
        resumeId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        tailoredResume: import("@prisma/client/runtime/library").JsonValue | null;
        coverLetter: string | null;
        technicalBrief: string | null;
        appliedAt: Date | null;
    }>;
}
export {};
