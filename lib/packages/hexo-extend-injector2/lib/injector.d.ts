export = Injector;
declare class Injector {
    constructor(ctx: any);
    _store: {};
    _run: {};
    _ctx: any;
    order: {
        REGISTER_NEXT_HELPER: number;
        REGISTER_VARIABLE: number;
        REGISTER_STYLE: number;
        REGISTER_JS: number;
        REGISTER_CSS: number;
    };
    config: any;
    clean(): void;
    get(entry: any, options: any): {
        list: () => any[];
        rendered: () => any[];
        text: (sep?: string) => string;
        toPromise: () => Promise<any>[];
    };
    getSize(entry: any): any;
    register(entry: any, value: any, predicate: () => boolean, priority: number, isRun: any): Injector;
    is(...types: any[]): (locals: any) => boolean;
    formatKey(entry: any): any;
    registerDefaultPoint(): void;
    registerHelper(): void;
    registerNexTHelper(): void;
}
