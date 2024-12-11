/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { View } from '../lib/index.ts'

import { getFileListActions, registerFileListAction, FileListAction } from '../lib/fileListAction.ts'
import { Folder } from '../lib/files/folder.ts'
import logger from '../lib/utils/logger.ts'

const context = {} as Folder
const view = {} as View

const mockAction = (id: string) => new FileListAction({
	id,
	displayName: () => 'Test',
	iconSvgInline: () => '<svg></svg>',
	order: 0,
	exec: async () => {},
})

describe('FileListActions init', () => {
	beforeEach(() => {
		delete window._nc_filelistactions
	})

	test('Uninitialized file list actions', () => {
		expect(window._nc_filelistactions).toBe(undefined)
		const actions = getFileListActions()
		expect(actions).toHaveLength(0)
	})

	test('Register a single file list action', () => {
		const actions = getFileListActions()
		expect(actions).toHaveLength(0)

		const testAction = mockAction('test')

		expect(testAction.id).toBe('test')
		expect(testAction.displayName({ view, context })).toBe('Test')
		expect(testAction.iconSvgInline({ view, context })).toBe('<svg></svg>')

		registerFileListAction(testAction)
		expect(actions).toHaveLength(1)
		expect(actions.at(0)).toStrictEqual(testAction)
	})

	test('Register multiple file list actions', () => {
		const actions = getFileListActions()
		expect(actions).toHaveLength(0)

		const fooAction = mockAction('foo')
		const barAction = mockAction('bar')
		const bazAction = mockAction('baz')

		registerFileListAction(fooAction)
		registerFileListAction(barAction)
		registerFileListAction(bazAction)
		expect(actions).toHaveLength(3)

		expect(actions.find(action => action.id === 'foo')).toStrictEqual(fooAction)
		expect(actions.find(action => action.id === 'bar')).toStrictEqual(barAction)
		expect(actions.find(action => action.id === 'baz')).toStrictEqual(bazAction)
	})

	test('Register an action with a duplicate id', () => {
		logger.error = vi.fn()

		const actions = getFileListActions()
		expect(actions).toHaveLength(0)

		const testActionA = mockAction('test')
		const testActionB = mockAction('test')

		registerFileListAction(testActionA)
		expect(actions).toHaveLength(1)

		registerFileListAction(testActionB)
		expect(logger.error).toHaveBeenCalledWith('FileListAction with id "test" is already registered', { action: testActionB })
		expect(actions).toHaveLength(1)
	})
})

describe('Invalid FileListAction creation', () => {
	test('Invalid id', () => {
		expect(() => new FileListAction({
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			order: 0,
			exec: async () => {},
		} as unknown as FileListAction),
		).toThrowError('Invalid id')
	})
	test('Invalid displayName', () => {
		expect(() => new FileListAction({
			id: 'test',
			iconSvgInline: () => '<svg></svg>',
			order: 0,
			exec: async () => {},
		} as unknown as FileListAction),
		).toThrowError('Invalid displayName function')
	})
	test('Invalid iconSvgInline', () => {
		expect(() => new FileListAction({
			id: 'test',
			displayName: () => 'Test',
			order: 0,
			exec: async () => {},
		} as unknown as FileListAction),
		).toThrowError('Invalid iconSvgInline function')
	})
	test('Invalid order', () => {
		expect(() => new FileListAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			order: null,
			exec: async () => {},
		} as unknown as FileListAction),
		).toThrowError('Invalid order')
	})
	test('Invalid enabled', () => {
		expect(() => new FileListAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			order: 0,
			enabled: null,
			exec: async () => {},
		} as unknown as FileListAction),
		).toThrowError('Invalid enabled function')
	})
	test('Invalid exec', () => {
		expect(() => new FileListAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			exec: null,
		} as unknown as FileListAction),
		).toThrowError('Invalid exec function')
	})
})

describe('FileListAction creation', () => {
	test('Create a FileListAction', async () => {
		const testAction = new FileListAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			order: 0,
			enabled: () => true,
			exec: async () => {},
		})

		expect(testAction.id).toBe('test')
		expect(testAction.displayName({ view, context })).toBe('Test')
		expect(testAction.iconSvgInline({ view, context })).toBe('<svg></svg>')
		expect(testAction.order).toBe(0)
		expect(testAction.enabled?.({ view, context })).toBe(true)
		await expect(testAction.exec({ view, context, nodes: [] })).resolves.toBe(undefined)
	})
})
