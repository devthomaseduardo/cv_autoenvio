"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
let AiService = AiService_1 = class AiService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiService_1.name);
        this.openai = new openai_1.default({
            apiKey: config.get('OPENAI_API_KEY'),
        });
        this.model = config.get('OPENAI_MODEL', 'gpt-4o-mini');
    }
    async analyzeJobMatch(jobDescription, userProfile) {
        this.logger.log('🤖 Analyzing job match with AI...');
        const prompt = `You are an expert recruiter and career coach with deep technical knowledge.

Analyze the compatibility between this job posting and the candidate profile.

## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE PROFILE:
- Headline: ${userProfile.headline}
- Summary: ${userProfile.summary}
- Seniority: ${userProfile.seniorityLevel}
- Years of Experience: ${userProfile.yearsExp}
- Skills: ${JSON.stringify(userProfile.skills)}

## YOUR TASK:
Return a JSON object with this EXACT structure:
{
  "overallScore": <0-100 integer>,
  "skillScore": <0-100 integer>,
  "seniorityScore": <0-100 integer>,
  "stackScore": <0-100 integer>,
  "cultureScore": <0-100 integer>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "highlights": ["Why candidate is strong for this role point 1", "point 2"],
  "gaps": ["Gap or risk point 1", "point 2"],
  "recommendation": "apply" | "consider" | "skip",
  "aiExplanation": "A 2-3 sentence strategic analysis explaining the match quality, main strengths, and most critical gaps."
}

Scoring guide:
- 80-100: Excellent match → apply
- 60-79: Good match with some gaps → consider
- Below 60: Too many gaps → skip

Be honest and specific. Return ONLY the JSON object.`;
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });
        const result = JSON.parse(response.choices[0].message.content);
        this.logger.log(`✅ Analysis complete. Score: ${result.overallScore}`);
        return result;
    }
    async tailorResume(baseResume, jobDescription, jobTitle, company) {
        this.logger.log(`✏️ Tailoring resume for: ${jobTitle} at ${company}`);
        const prompt = `You are an expert resume writer and ATS optimization specialist.

Your task: Rewrite the candidate's resume to maximize compatibility with this specific job posting.

## TARGET JOB:
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}

## BASE RESUME:
${JSON.stringify(baseResume, null, 2)}

## YOUR TASK:
1. Rewrite the summary/headline to directly mirror job requirements
2. Reorder and emphasize skills that match the job
3. Rewrite experience bullets to highlight relevant impact
4. Use exact keywords from the job description (for ATS)
5. Generate a personalized cover letter (3 paragraphs max)
6. Generate a technical brief (2-3 sentences that frame the candidate perfectly)

Return a JSON object with this EXACT structure:
{
  "tailoredContent": { ...same structure as base resume but optimized... },
  "coverLetter": "Full cover letter text...",
  "technicalBrief": "2-3 sentences technical positioning...",
  "keyChanges": ["Change made 1", "Change made 2", "Change made 3"]
}

Return ONLY the JSON object.`;
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 3000,
        });
        const result = JSON.parse(response.choices[0].message.content);
        this.logger.log(`✅ Resume tailored with ${result.keyChanges?.length || 0} key changes`);
        return result;
    }
    async extractJobSkills(description) {
        const prompt = `Extract technical skills and requirements from this job description.

## JOB DESCRIPTION:
${description}

Return ONLY this JSON:
{
  "required": ["skill1", "skill2"],
  "niceToHave": ["skill3"],
  "seniority": "junior" | "mid" | "senior" | "lead" | "staff"
}`;
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });
        return JSON.parse(response.choices[0].message.content);
    }
    async generateCoverLetter(jobTitle, company, jobDescription, userProfile, resumeSummary) {
        const prompt = `Write a compelling, personalized cover letter.

Job: ${jobTitle} at ${company}
Candidate: ${userProfile.name}, ${userProfile.headline}
Resume Summary: ${resumeSummary}

Key requirements from job:
${jobDescription.slice(0, 1000)}

Write a 3-paragraph cover letter that:
1. Opens with a strong hook connecting candidate's background to the specific role
2. Demonstrates 2-3 concrete achievements relevant to the job requirements
3. Closes with enthusiasm and a clear call-to-action

Tone: Professional but human. No clichés. No "I am writing to apply for..."
Return just the letter text.`;
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 600,
        });
        return response.choices[0].message.content;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map