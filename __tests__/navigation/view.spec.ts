/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from 'vitest'
import { ContentsWithRoot, View, ViewData } from '../../lib/navigation/view'
import { Folder, Navigation } from '../../lib'

// This is used for testing that users can implement their own views which have access
// to `this` for allowing private state
class MyView extends View {

	public testing = false

	constructor() {
		super({
			id: 'my-view',
			name: 'My view',
			icon: '<svg></svg>',
		} as ViewData)
	}

	public async getContents(path: string): Promise<ContentsWithRoot> {
		this.testing = true
		return {
			folder: new Folder({
				owner: 'foo',
				source: `http://example.com/src/${path}`,
				root: '/src',
			}),
			contents: [],
		}
	}

}

describe('Custom view', () => {

	test('Can inherite from the View class', () => {
		// eslint-disable-next-line no-new
		expect(() => new MyView()).not.toThrow()
	})

	test('Custom view classes have "this" context', () => {
		const view = new MyView()
		expect(view.testing).toBe(false)
		view.getContents('/')
		expect(view.testing).toBe(true)
	})

	test('Can register custom view', () => {
		const view = new MyView()
		const navigation = new Navigation()
		expect(() => navigation.register(view)).not.toThrow()
		expect(navigation.views.length).toBe(1)
	})

})
