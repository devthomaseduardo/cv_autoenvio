declare class ExperienceItemDto {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    highlights?: string[];
}
declare class EducationItemDto {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
}
declare class SkillItemDto {
    name: string;
    level?: string;
}
export declare class CreateResumeDto {
    title: string;
    isBase?: boolean;
    summary: string;
    experience?: ExperienceItemDto[];
    education?: EducationItemDto[];
    skills?: SkillItemDto[];
    languages?: {
        name: string;
        level: string;
    }[];
    certifications?: {
        name: string;
        issuer: string;
        date: string;
        url?: string;
    }[];
    projects?: {
        name: string;
        description: string;
        url?: string;
        stack: string[];
    }[];
}
export declare class UpdateResumeDto {
    title?: string;
    isBase?: boolean;
    summary?: string;
}
export {};
