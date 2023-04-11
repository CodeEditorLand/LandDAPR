// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { DaprComponentMetadata } from '../../services/daprClient';
import TreeNode from "../treeNode";
import { DaprStateNode } from './daprStateNode';
import { DaprStateKeyProvider } from '../../services/daprStateKeyProvider';

export interface DaprApplicationStateStore {
    getKeys(): Promise<string[]>;
}

export default class DaprComponentMetadataNode implements TreeNode {
    constructor(
        private readonly applicationId: string,
        public readonly daprComponentMetadata: DaprComponentMetadata,
        private readonly daprStateKeyProvider: DaprStateKeyProvider,) {
    }

    getChildren(): TreeNode[] {
        return [
            new DaprStateNode(
                async () => {
                    const keys = await this.daprStateKeyProvider(this.applicationId, this.daprComponentMetadata.name);

                    return keys.map(key => ({
                        name: key,
                        value: vscode.Uri.parse(`dapr://state/${this.applicationId}/${this.daprComponentMetadata.name}/keys/${key}`)
                    }));
                })
        ];
    }

    getTreeItem(): Promise<vscode.TreeItem> {
        const isStateStore = this.daprComponentMetadata.type.startsWith('state.');
        const item = new vscode.TreeItem(this.daprComponentMetadata.name, isStateStore ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);

        item.contextValue = 'metadata';
        item.iconPath = new vscode.ThemeIcon(DaprComponentMetadataNode.getThemeIconId(this.daprComponentMetadata.type));

        return Promise.resolve(item); 
    }

    private static getThemeIconId(componentType: string): string {
        const split = componentType.split('.');

        switch (split[0]) {
            case 'pubsub':
                return 'broadcast';
            case 'state':
                return 'database';
            default:
                return 'archive';
        }
    }
}