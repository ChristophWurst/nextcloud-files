/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Folder } from './files/folder'
import { Node } from './files/node'
import { View } from './navigation'

type ActionContextSingle = {
	nodes: [Node],
	view: View,
	context: Folder,
}

type ActionContext = {
	nodes: Node[],
	view: View,
	context: Folder,
}

type ViewActionContext = {
	view: View,
	context: Folder,
}
