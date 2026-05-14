export declare enum JobSource {
    LINKEDIN = "linkedin",
    GUPY = "gupy",
    INDEED = "indeed",
    GLASSDOOR = "glassdoor",
    MANUAL = "manual"
}
export declare class SubmitJobUrlDto {
    url: string;
}
export declare class CreateJobManuallyDto {
    title: string;
    company: string;
    description: string;
    location?: string;
    workMode?: string;
    sourceUrl?: string;
}
export declare class JobQueryDto {
    search?: string;
    workMode?: string;
    page?: number;
    limit?: number;
    minScore?: number;
}
