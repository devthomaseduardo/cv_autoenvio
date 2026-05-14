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
var ScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const cheerio = require("cheerio");
let ScrapingService = ScrapingService_1 = class ScrapingService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(ScrapingService_1.name);
        this.timeout = config.get('SCRAPER_TIMEOUT', 30000);
    }
    async scrapeJobUrl(url) {
        this.logger.log(`🔍 Scraping: ${url}`);
        const source = this.detectSource(url);
        try {
            switch (source) {
                case 'linkedin':
                    return await this.scrapeLinkedIn(url);
                case 'gupy':
                    return await this.scrapeGupy(url);
                case 'indeed':
                    return await this.scrapeIndeed(url);
                default:
                    return await this.scrapeGeneric(url, source);
            }
        }
        catch (error) {
            this.logger.error(`Failed to scrape ${url}: ${error.message}`);
            return this.fallbackScrape(url, source, error.message);
        }
    }
    detectSource(url) {
        if (url.includes('linkedin.com'))
            return 'linkedin';
        if (url.includes('gupy.io') || url.includes('portal.gupy'))
            return 'gupy';
        if (url.includes('indeed.com'))
            return 'indeed';
        if (url.includes('glassdoor.com'))
            return 'glassdoor';
        if (url.includes('catho.com'))
            return 'catho';
        if (url.includes('infojobs.com'))
            return 'infojobs';
        return 'generic';
    }
    async scrapeLinkedIn(url) {
        const response = await axios_1.default.get(url, {
            timeout: this.timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
        });
        const $ = cheerio.load(response.data);
        const title = $('h1.topcard__title, h1[data-test="job-title"]').text().trim() ||
            $('h1').first().text().trim();
        const company = $('a.topcard__org-name-link, .topcard__flavor--black-link').first().text().trim() ||
            $('[data-test="job-poster-name"]').text().trim();
        const location = $('span.topcard__flavor--bullet').first().text().trim() ||
            $('.job-details-jobs-unified-top-card__bullet').first().text().trim();
        const description = $('.description__text, .jobs-description__content, #job-details').text().trim();
        return {
            title: title || 'Unknown Title',
            company: company || 'Unknown Company',
            location,
            description: description || response.data.slice(0, 2000),
            skills: this.extractSkillsFromText(description),
            source: 'linkedin',
            workMode: this.detectWorkMode(description + ' ' + location),
        };
    }
    async scrapeGupy(url) {
        const jobIdMatch = url.match(/jobs\/(\d+)/);
        if (jobIdMatch) {
            const companyMatch = url.match(/https?:\/\/([^.]+)\.gupy\.io/);
            const company = companyMatch ? companyMatch[1] : 'unknown';
            const jobId = jobIdMatch[1];
            try {
                const apiUrl = `https://${company}.gupy.io/api/jobs/${jobId}`;
                const response = await axios_1.default.get(apiUrl, { timeout: this.timeout });
                const data = response.data;
                return {
                    title: data.name || data.title,
                    company: data.companyName || company,
                    location: data.city,
                    description: data.description || data.jobDescription,
                    requirements: data.prerequisites,
                    skills: this.extractSkillsFromText(data.description || ''),
                    source: 'gupy',
                    externalId: String(jobId),
                    workMode: this.normalizeWorkMode(data.workplaceType),
                };
            }
            catch {
                return this.scrapeGeneric(url, 'gupy');
            }
        }
        return this.scrapeGeneric(url, 'gupy');
    }
    async scrapeIndeed(url) {
        return this.scrapeGeneric(url, 'indeed');
    }
    async scrapeGeneric(url, source) {
        const response = await axios_1.default.get(url, {
            timeout: this.timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });
        const $ = cheerio.load(response.data);
        $('script, style, nav, footer, header, .ad, .advertisement').remove();
        const title = $('h1').first().text().trim() ||
            $('title').text().replace(/[-|].*/, '').trim();
        const company = $('[class*="company"], [class*="employer"], [itemprop="hiringOrganization"]')
            .first()
            .text()
            .trim() || 'Unknown Company';
        const description = $('[class*="description"], [class*="job-description"], [class*="requirements"], main')
            .first()
            .text()
            .trim() ||
            $('body').text().slice(0, 3000);
        return {
            title: title || 'Unnamed Position',
            company,
            description: description.slice(0, 5000),
            skills: this.extractSkillsFromText(description),
            source,
            workMode: this.detectWorkMode(description),
        };
    }
    fallbackScrape(url, source, errorMsg) {
        this.logger.warn(`Using fallback for ${url}: ${errorMsg}`);
        return {
            title: 'Pending Analysis',
            company: 'Unknown',
            description: `Job URL: ${url}\n\nScraping failed: ${errorMsg}\n\nPlease add the job description manually.`,
            skills: [],
            source,
        };
    }
    extractSkillsFromText(text) {
        const COMMON_TECH_SKILLS = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'PHP',
            'Ruby', 'Kotlin', 'Swift', 'Dart', 'Scala', 'Elixir',
            'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'HTML', 'CSS', 'Tailwind',
            'Redux', 'Zustand', 'Vite', 'Webpack',
            'Node.js', 'NestJS', 'Express', 'Fastify', 'Django', 'FastAPI', 'Spring',
            'Laravel', 'Rails', 'Gin', 'Fiber',
            'React Native', 'Flutter', 'iOS', 'Android', 'Expo',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Cassandra', 'DynamoDB',
            'Elasticsearch', 'Prisma', 'TypeORM', 'Sequelize',
            'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
            'GitHub Actions', 'Jenkins', 'Ansible', 'Linux',
            'GraphQL', 'REST', 'gRPC', 'WebSocket', 'Microservices', 'RabbitMQ',
            'Kafka', 'Redis', 'BullMQ', 'JWT', 'OAuth', 'Git', 'Agile', 'Scrum',
        ];
        const textUpper = text.toLowerCase();
        return COMMON_TECH_SKILLS.filter((skill) => textUpper.includes(skill.toLowerCase()));
    }
    detectWorkMode(text) {
        const lower = text.toLowerCase();
        if (lower.includes('remoto') || lower.includes('remote') || lower.includes('100% remoto')) {
            return 'remote';
        }
        if (lower.includes('híbrido') || lower.includes('hybrid'))
            return 'hybrid';
        if (lower.includes('presencial') || lower.includes('on-site') || lower.includes('onsite')) {
            return 'onsite';
        }
        return 'unspecified';
    }
    normalizeWorkMode(gupyType) {
        if (!gupyType)
            return 'unspecified';
        const map = {
            remote: 'remote',
            hybrid: 'hybrid',
            on_site: 'onsite',
        };
        return map[gupyType] || 'unspecified';
    }
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = ScrapingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map