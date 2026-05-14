declare class SkillDto {
    name: string;
    level?: string;
    yearsExp?: number;
}
export declare class UpdateProfileDto {
    headline?: string;
    summary?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    yearsExp?: number;
    seniorityLevel?: string;
    desiredSalary?: number;
    availableFor?: string[];
    skills?: SkillDto[];
}
export {};
