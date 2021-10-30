import { Route, RouteConfig } from 'vue-router';
export declare type _RouteConfig = RouteConfig;
export declare type _Route = Route;
export declare type RouteItem = _RouteConfig | _Route;
export interface MenuItem {
    icon?: string;
    index: string;
    name?: string;
    children?: MenuItem[];
}
export declare const getRouterFullPath: (route: RouteConfig, parentPath: string) => string;
export declare const getRouteName: (route: RouteConfig) => string;
export declare const getRouterMapByRouter: (routes?: RouteConfig[]) => Map<string, RouteConfig>;
export declare const getPermissionMapByPermission: (permissions: string[]) => Map<string, string[]>;
export declare const getMenuByRouteMap: (menuList: Array<MenuItem>, routeMap: Map<string, RouteConfig>) => Array<MenuItem>;
export declare const getPermissionMapByRouterMap: (routeMap: Map<string, RouteConfig>) => Map<string, string[]>;
export declare const getPermissionItemByRouter: (route: RouteConfig, path: string) => Map<string, string[]>;
export declare const getPermissionMenuItem: ({ routerPermissions, permissions }: {
    routerPermissions: string[] | undefined;
    permissions: string[];
}) => boolean;
export declare const getPermissionMenuList: (routerMap: Map<string, RouteConfig>, menus: MenuItem[], permissions: string[]) => MenuItem[];
export declare const defaultAuthFn: (permission: string, permissions: string[]) => boolean;
