export const disable_default_point: boolean;
export const injector_point_headbegin: boolean;
export const injector_point_headend: boolean;
export const injector_point_bodybegin: boolean;
export const injector_point_bodyend: boolean;
export const load_next_compatible: boolean;
export const load_next_plugin: boolean;
export namespace js {
    const enable: boolean;
    const path: string;
    const options: {};
}
export namespace css {
    const enable_1: boolean;
    export { enable_1 as enable };
    export namespace path_1 {
        namespace _default {
            const path_2: string;
            export { path_2 as path };
            export const link: string;
        }
        export { _default as default };
        export namespace dark {
            const path_3: string;
            export { path_3 as path };
            const link_1: string;
            export { link_1 as link };
        }
        export namespace light {
            const path_4: string;
            export { path_4 as path };
            const link_2: string;
            export { link_2 as link };
        }
    }
    export { path_1 as path };
    const options_1: {};
    export { options_1 as options };
}
