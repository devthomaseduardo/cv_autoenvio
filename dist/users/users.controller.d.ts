import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
    }): Promise<{
        profile: {
            skills: {
                level: string;
                name: string;
                id: string;
                yearsExp: number | null;
                profileId: string;
                category: string | null;
            }[];
        } & {
            summary: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            headline: string | null;
            location: string | null;
            linkedinUrl: string | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            yearsExp: number | null;
            seniorityLevel: string | null;
            desiredSalary: number | null;
            availableFor: string[];
            userId: string;
        };
        name: string;
        email: string;
        id: string;
        avatarUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(dto: UpdateProfileDto, user: {
        id: string;
    }): Promise<{
        profile: {
            skills: {
                level: string;
                name: string;
                id: string;
                yearsExp: number | null;
                profileId: string;
                category: string | null;
            }[];
        } & {
            summary: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            headline: string | null;
            location: string | null;
            linkedinUrl: string | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            yearsExp: number | null;
            seniorityLevel: string | null;
            desiredSalary: number | null;
            availableFor: string[];
            userId: string;
        };
        name: string;
        email: string;
        id: string;
        avatarUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDashboard(user: {
        id: string;
    }): Promise<{
        profile: {
            profile: {
                skills: {
                    level: string;
                    name: string;
                    id: string;
                    yearsExp: number | null;
                    profileId: string;
                    category: string | null;
                }[];
            } & {
                summary: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                headline: string | null;
                location: string | null;
                linkedinUrl: string | null;
                githubUrl: string | null;
                portfolioUrl: string | null;
                yearsExp: number | null;
                seniorityLevel: string | null;
                desiredSalary: number | null;
                availableFor: string[];
                userId: string;
            };
            name: string;
            email: string;
            id: string;
            avatarUrl: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        stats: {
            totalApplications: number;
            savedJobs: number;
            averageMatchScore: number;
            profileCompletion: number;
        };
        recentAnalyses: ({
            job: {
                title: string;
                company: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            jobId: string;
            overallScore: number;
            skillScore: number;
            seniorityScore: number;
            cultureScore: number | null;
            stackScore: number;
            matchedSkills: string[];
            missingSkills: string[];
            highlights: string[];
            gaps: string[];
            recommendation: string;
            aiExplanation: string;
        })[];
    }>;
}
