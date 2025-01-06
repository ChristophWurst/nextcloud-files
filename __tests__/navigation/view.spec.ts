/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from 'vitest'
import { ContentsWithRoot, View, type ViewData } from '../../lib/navigation/view'
import { Folder, Navigation } from '../../lib'

// This is used for testing that users can implement their own views which have access
// to `this` for allowing private state
class MyView implements ViewData {

	public readonly id = 'my-view'
	public readonly name = 'My view'
	public readonly icon = '<svg></svg>'

	public async getContents(): Promise<ContentsWithRoot> {
		return {
			folder: this.getFolder(),
			contents: [],
		}
	}

	private getFolder() {
		return new Folder({
			owner: 'test',
			source: 'http://example.com/remote.php/dav/root/folder',
			root: '/root',
		})
	}

}

describe('Custom view', () => {

	test('Can pass class as view data', () => {
		// eslint-disable-next-line no-new
		expect(() => new View(new MyView())).not.toThrow()
	})

	test('Custom view classes have "this" context', async () => {
		const view = new View(new MyView())
		const response = await view.getContents('/')
		// did not throw yet

		expect(response.folder).toBeInstanceOf(Folder)
		expect(response.folder.owner).toBe('test')
	})

	test('Can register custom view', () => {
		const view = new View(new MyView())
		const navigation = new Navigation()
		expect(() => navigation.register(view)).not.toThrow()
		expect(navigation.views.length).toBe(1)
	})

})
