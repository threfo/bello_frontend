import * as utils from './utils';
export default class Auth {
    authFn: () => false;
    routeMap: Map<string, utils._RouteConfig>;
    menu: utils.MenuItem[];
    permissionRouterMap: Map<string, string[]>;
    constructor({ authFn, routes, menu }: {
        authFn?: any;
        routes: any;
        menu: any;
    });
    static install(Vue: any): void;
    checkRoutePermission({ route, permissions }: {
        route: utils._Route;
        permissions: string[];
    }): boolean;
}
