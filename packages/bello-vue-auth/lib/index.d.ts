import * as utils from './utils';
export default class Auth {
    authFn: () => false;
    routeMap: Map<string, utils._RouteConfig>;
    menu: utils.MenuItem[];
    permissionRouterMap: Map<string, string[]>;
    constructor({ authFn, routes, menu }: {
        authFn?: any;
        routes: utils._RouteConfig[];
        menu: utils.MenuItem[];
    });
    static install(Vue: any): void;
    updateRouter(routes: utils._RouteConfig[]): utils._RouteConfig[];
    updateMenu(menu: utils.MenuItem[]): utils.MenuItem[];
    checkRoutePermission({ route, permissions }: {
        route: utils._Route;
        permissions: string[];
    }): boolean;
    getMenuByPermissions(permissions: string[]): utils.MenuItem[];
}
