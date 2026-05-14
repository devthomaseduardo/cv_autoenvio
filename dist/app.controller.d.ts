import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): {
        name: string;
        version: string;
        description: string;
        docs: string;
        health: string;
        timestamp: string;
    };
}
