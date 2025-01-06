/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, it, expect, vi } from 'vitest'
import { Navigation, getNavigation } from '../../lib/navigation/navigation'
import { View } from '../../lib/navigation/view'

const mockView = (id = 'view', order = 1) => new View({ id, order, name: 'View', icon: '<svg></svg>', getContents: () => Promise.reject(new Error()) })

describe('getNavigation', () => {
	it('creates a new navigation if needed', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete window._nc_navigation
		const navigation = getNavigation()
		expect(navigation).toBeInstanceOf(Navigation)
	})

	it('stores the navigation globally', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete window._nc_navigation
		const navigation = getNavigation()
		expect(navigation).toBeInstanceOf(Navigation)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(window._nc_navigation).toBeInstanceOf(Navigation)
	})

	it('reuses an existing navigation', () => {
		const navigation = new Navigation()
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window._nc_navigation = navigation
		expect(getNavigation()).toBe(navigation)
	})
})

describe('Navigation', () => {
	it('Can register a view', async () => {
		const navigation = new Navigation()
		const view = mockView()
		navigation.register(view)

		expect(navigation.views).toEqual([view])
	})

	it('Throws when registering the same view twice', async () => {
		const navigation = new Navigation()
		const view = mockView()
		navigation.register(view)
		expect(() => navigation.register(view)).toThrow(/already registered/)
		expect(navigation.views).toEqual([view])
	})

	it('Emits update event after registering a view', async () => {
		const navigation = new Navigation()
		const view = mockView()
		const listener = vi.fn()

		navigation.addEventListener('update', listener)
		navigation.register(view)

		expect(listener).toHaveBeenCalled()
		expect(listener.mock.calls[0][0].type).toBe('update')
	})

	it('Can remove a view', async () => {
		const navigation = new Navigation()
		const view = mockView()
		navigation.register(view)
		expect(navigation.views).toEqual([view])
		navigation.remove(view.id)
		expect(navigation.views).toEqual([])
	})

	it('Emits update event after removing a view', async () => {
		const navigation = new Navigation()
		const view = mockView()
		const listener = vi.fn()
		navigation.register(view)
		navigation.addEventListener('update', listener)

		navigation.remove(view.id)
		expect(listener).toHaveBeenCalled()
		expect(listener.mock.calls[0][0].type).toBe('update')
	})

	it('does not emit an event when nothing was removed', async () => {
		const navigation = new Navigation()
		const listener = vi.fn()
		navigation.addEventListener('update', listener)

		navigation.remove('not-existing')
		expect(listener).not.toHaveBeenCalled()
	})

	it('Can set a view as active', async () => {
		const navigation = new Navigation()
		const view = mockView()
		navigation.register(view)

		expect(navigation.active).toBe(null)

		navigation.setActive(view)
		expect(navigation.active).toEqual(view)
	})

	it('Emits event when setting a view as active', async () => {
		const navigation = new Navigation()
		const view = mockView()
		navigation.register(view)

		// add listener
		const listener = vi.fn()
		navigation.addEventListener('updateActive', listener)

		navigation.setActive(view)
		expect(listener).toHaveBeenCalledOnce()
		// So it was called, we then expect the first argument of the first call to be the event with the view as the detail
		expect(listener.mock.calls[0][0].detail).toBe(view)
	})
})
