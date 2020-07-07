// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentChannelId} from 'selectors/entities/common';
import {
    getMySystemPermissions,
    getMySystemRoles,
    getRoles,
    PermissionsOptions,
    SysConsoleItemOptions,
} from 'selectors/entities/roles_helpers';
import {getTeamMemberships, getCurrentTeamId} from 'selectors/entities/teams';

import {Role} from 'types/roles';
import {GlobalState} from 'types/store';
import {Dictionary} from 'types/utilities';

import {ResourceToSysConsolePermissionsTable} from '../../constants/permissions_sysconsole';

export {getMySystemPermissions, getMySystemRoles, getRoles};

export const getMyTeamRoles: (state: GlobalState) => Dictionary<Set<string>> = createSelector(
    getTeamMemberships,
    (teamsMemberships) => {
        const roles: Dictionary<Set<string>> = {};
        if (teamsMemberships) {
            for (const key in teamsMemberships) {
                if (teamsMemberships.hasOwnProperty(key) && teamsMemberships[key].roles) {
                    roles[key] = new Set<string>(teamsMemberships[key].roles.split(' '));
                }
            }
        }
        return roles;
    },
);

export const getMyChannelRoles: (state: GlobalState) => Dictionary<Set<string>> = createSelector(
    (state: GlobalState) => state.entities.channels.myMembers,
    (channelsMemberships) => {
        const roles: Dictionary<Set<string>> = {};
        if (channelsMemberships) {
            for (const key in channelsMemberships) {
                if (channelsMemberships.hasOwnProperty(key) && channelsMemberships[key].roles) {
                    roles[key] = new Set<string>(channelsMemberships[key].roles.split(' '));
                }
            }
        }
        return roles;
    },
);

export const getMyRoles: (state: GlobalState) => {
    system: Set<string>;
    team: Dictionary<Set<string>>;
    channel: Dictionary<Set<string>>;
} = createSelector(
    getMySystemRoles,
    getMyTeamRoles,
    getMyChannelRoles,
    (systemRoles, teamRoles, channelRoles) => {
        return {
            system: systemRoles,
            team: teamRoles,
            channel: channelRoles,
        };
    },
);

export const getRolesById: (state: GlobalState) => Dictionary<Role> = createSelector(
    getRoles,
    (rolesByName) => {
        const rolesById: Dictionary<Role> = {};
        for (const role of Object.values(rolesByName)) {
            rolesById[role.id] = role;
        }
        return rolesById;
    },
);

export const getMyCurrentTeamPermissions: (state: GlobalState) => Set<string> = createSelector(
    getMyTeamRoles,
    getRoles,
    getMySystemPermissions,
    getCurrentTeamId,
    (myTeamRoles, roles, systemPermissions, teamId) => {
        const permissions = new Set<string>();
        if (myTeamRoles[teamId]) {
            for (const roleName of myTeamRoles[teamId]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of systemPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyCurrentChannelPermissions: (state: GlobalState) => Set<string> = createSelector(
    getMyChannelRoles,
    getRoles,
    getMyCurrentTeamPermissions,
    getCurrentChannelId,
    (myChannelRoles, roles, teamPermissions, channelId) => {
        const permissions = new Set<string>();
        if (myChannelRoles[channelId]) {
            for (const roleName of myChannelRoles[channelId]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of teamPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyTeamPermissions: (state: GlobalState, options: PermissionsOptions) => Set<string> = createSelector(
    getMyTeamRoles,
    getRoles,
    getMySystemPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.team,
    (myTeamRoles, roles, systemPermissions, teamId) => {
        const permissions = new Set<string>();
        if (myTeamRoles[teamId!]) {
            for (const roleName of myTeamRoles[teamId!]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of systemPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyChannelPermissions: (state: GlobalState, options: PermissionsOptions) => Set<string> = createSelector(
    getMyChannelRoles,
    getRoles,
    getMyTeamPermissions,
    (state, options: PermissionsOptions) => options.channel,
    (myChannelRoles, roles, teamPermissions, channelId) => {
        const permissions = new Set<string>();
        if (myChannelRoles[channelId!]) {
            for (const roleName of myChannelRoles[channelId!]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of teamPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const haveISystemPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    getMySystemPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveITeamPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    getMyTeamPermissions,
    (state, options) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveIChannelPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    getMyChannelPermissions,
    (state, options) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveICurrentTeamPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    getMyCurrentTeamPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveICurrentChannelPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    getMyCurrentChannelPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

//gets the permission set mapped to the current resource
export const getPermissionsOnSystemConsoleResource = createSelector(
    (state: GlobalState, options: SysConsoleItemOptions) => options.resourceId,
    (resourceId) => {
        const permissions = Object.entries(ResourceToSysConsolePermissionsTable).filter(([mappedResourceId]) => resourceId.startsWith(mappedResourceId)).map((entry) => entry[1]).flat();
        return permissions;
    },
);

//return true if the current user has no permission on the resource
export const haveIPermissionOnSysConsoleItem: (state: GlobalState, options: SysConsoleItemOptions) => boolean = createSelector(
    getMySystemPermissions,
    getPermissionsOnSystemConsoleResource,
    (mySystemPermissions: Set<string>, permissionsOnResource: Array<string>) => {
        //go over the permissions mapped to the resource and check if the current user has any permission matching
        const commonPermissions = permissionsOnResource.filter((x) => mySystemPermissions.has(x));
        return commonPermissions.length > 0;
    },
);

//return true if current user has read-write or write-only permission on the resource
export const haveIWritePermissionOnSysConsoleItem: (state: GlobalState, options: SysConsoleItemOptions) => boolean = createSelector(
    getMySystemPermissions,
    getPermissionsOnSystemConsoleResource,
    (mySystemPermissions: Set<string>, permissionsOnResource: Array<string>) => {
        //go over the permissions mapped to the resource and check if the current user has any permission matching
        const commonPermissions = permissionsOnResource.filter((x) => mySystemPermissions.has(x));

        const haveRWPermission = commonPermissions.length > 0;

        //go over the result permissions set and check if it contains a write permission
        const haveWPermission = commonPermissions.some((permission) => permission.startsWith('write'));

        //return true if current user has no permission or he has a permission which is not write(hence read)
        return (haveRWPermission || haveWPermission);
    },
);