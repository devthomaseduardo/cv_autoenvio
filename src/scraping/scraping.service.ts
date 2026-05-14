import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
  title: string;
  company: string;
  location?: string;
  workMode?: string;
  description: string;
  requirements?: string;
  skills: string[];
  seniority?: string;
  source: string;
  postedAt?: Date;
  externalId?: string;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly timeout: number;

  constructor(private config: ConfigService) {
    this.timeout = config.get<number>('SCRAPER_TIMEOUT', 30000);
  }

  async scrapeJobUrl(url: string): Promise<ScrapedJob> {
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
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      // Return a minimal result so the flow can continue
      return this.fallbackScrape(url, source, error.message);
    }
  }

  // ── Source detection ──────────────────────────────────────────────────
  private detectSource(url: string): string {
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('gupy.io') || url.includes('portal.gupy')) return 'gupy';
    if (url.includes('indeed.com')) return 'indeed';
    if (url.includes('glassdoor.com')) return 'glassdoor';
    if (url.includes('catho.com')) return 'catho';
    if (url.includes('infojobs.com')) return 'infojobs';
    return 'generic';
  }

  // ── LinkedIn scraper ──────────────────────────────────────────────────
  private async scrapeLinkedIn(url: string): Promise<ScrapedJob> {
    // LinkedIn requires special handling (often needs Playwright for full rendering)
    // This is a simplified cheerio-based approach for public job pages
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);

    const title =
      $('h1.topcard__title, h1[data-test="job-title"]').text().trim() ||
      $('h1').first().text().trim();

    const company =
      $('a.topcard__org-name-link, .topcard__flavor--black-link').first().text().trim() ||
      $('[data-test="job-poster-name"]').text().trim();

    const location =
      $('span.topcard__flavor--bullet').first().text().trim() ||
      $('.job-details-jobs-unified-top-card__bullet').first().text().trim();

    const description =
      $('.description__text, .jobs-description__content, #job-details').text().trim();

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

  // ── Gupy scraper ──────────────────────────────────────────────────────
  private async scrapeGupy(url: string): Promise<ScrapedJob> {
    // Gupy has a public API for many job boards
    // Pattern: https://COMPANY.gupy.io/jobs/ID
    const jobIdMatch = url.match(/jobs\/(\d+)/);

    if (jobIdMatch) {
      const companyMatch = url.match(/https?:\/\/([^.]+)\.gupy\.io/);
      const company = companyMatch ? companyMatch[1] : 'unknown';
      const jobId = jobIdMatch[1];

      try {
        const apiUrl = `https://${company}.gupy.io/api/jobs/${jobId}`;
        const response = await axios.get(apiUrl, { timeout: this.timeout });
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
      } catch {
        // Fallback to HTML scraping
        return this.scrapeGeneric(url, 'gupy');
      }
    }

    return this.scrapeGeneric(url, 'gupy');
  }

  // ── Indeed scraper ────────────────────────────────────────────────────
  private async scrapeIndeed(url: string): Promise<ScrapedJob> {
    return this.scrapeGeneric(url, 'indeed');
  }

  // ── Generic HTML scraper ──────────────────────────────────────────────
  private async scrapeGeneric(url: string, source: string): Promise<ScrapedJob> {
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove noise
    $('script, style, nav, footer, header, .ad, .advertisement').remove();

    const title =
      $('h1').first().text().trim() ||
      $('title').text().replace(/[-|].*/,'').trim();

    // Try to find company name
    const company =
      $('[class*="company"], [class*="employer"], [itemprop="hiringOrganization"]')
        .first()
        .text()
        .trim() || 'Unknown Company';

    const description =
      $('[class*="description"], [class*="job-description"], [class*="requirements"], main')
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

  // ── Fallback when scraping fails ──────────────────────────────────────
  private fallbackScrape(url: string, source: string, errorMsg: string): ScrapedJob {
    this.logger.warn(`Using fallback for ${url}: ${errorMsg}`);
    return {
      title: 'Pending Analysis',
      company: 'Unknown',
      description: `Job URL: ${url}\n\nScraping failed: ${errorMsg}\n\nPlease add the job description manually.`,
      skills: [],
      source,
    };
  }

  // ── Skill extraction ──────────────────────────────────────────────────
  private extractSkillsFromText(text: string): string[] {
    const COMMON_TECH_SKILLS = [
      // Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'PHP',
      'Ruby', 'Kotlin', 'Swift', 'Dart', 'Scala', 'Elixir',
      // Frontend
      'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'HTML', 'CSS', 'Tailwind',
      'Redux', 'Zustand', 'Vite', 'Webpack',
      // Backend
      'Node.js', 'NestJS', 'Express', 'Fastify', 'Django', 'FastAPI', 'Spring',
      'Laravel', 'Rails', 'Gin', 'Fiber',
      // Mobile
      'React Native', 'Flutter', 'iOS', 'Android', 'Expo',
      // Databases
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Cassandra', 'DynamoDB',
      'Elasticsearch', 'Prisma', 'TypeORM', 'Sequelize',
      // Cloud/DevOps
      'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
      'GitHub Actions', 'Jenkins', 'Ansible', 'Linux',
      // Tools/Concepts
      'GraphQL', 'REST', 'gRPC', 'WebSocket', 'Microservices', 'RabbitMQ',
      'Kafka', 'Redis', 'BullMQ', 'JWT', 'OAuth', 'Git', 'Agile', 'Scrum',
    ];

    const textUpper = text.toLowerCase();
    return COMMON_TECH_SKILLS.filter((skill) =>
      textUpper.includes(skill.toLowerCase()),
    );
  }

  // ── Work mode detection ───────────────────────────────────────────────
  private detectWorkMode(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('remoto') || lower.includes('remote') || lower.includes('100% remoto')) {
      return 'remote';
    }
    if (lower.includes('híbrido') || lower.includes('hybrid')) return 'hybrid';
    if (lower.includes('presencial') || lower.includes('on-site') || lower.includes('onsite')) {
      return 'onsite';
    }
    return 'unspecified';
  }

  private normalizeWorkMode(gupyType?: string): string {
    if (!gupyType) return 'unspecified';
    const map: Record<string, string> = {
      remote: 'remote',
      hybrid: 'hybrid',
      on_site: 'onsite',
    };
    return map[gupyType] || 'unspecified';
  }
}
