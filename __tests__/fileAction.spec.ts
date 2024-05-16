/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-new */
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getFileActions, registerFileAction, FileAction, DefaultType } from '../lib/fileAction'
import logger from '../lib/utils/logger'

describe('FileActions init', () => {

	beforeEach(() => {
		delete window._nc_fileactions
	})

	test('Getting empty uninitialized FileActions', () => {
		logger.debug = vi.fn()
		const fileActions = getFileActions()
		expect(window._nc_fileactions).toBeDefined()
		expect(fileActions).toHaveLength(0)
		expect(logger.debug).toHaveBeenCalledTimes(1)
	})

	test('Initializing FileActions', () => {
		logger.debug = vi.fn()
		const action = new FileAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			exec: async () => true,
		})

		expect(action.id).toBe('test')
		expect(action.displayName([], {})).toBe('Test')
		expect(action.iconSvgInline([], {})).toBe('<svg></svg>')

		registerFileAction(action)

		expect(window._nc_fileactions).toHaveLength(1)
		expect(getFileActions()).toHaveLength(1)
		expect(getFileActions()[0]).toStrictEqual(action)
		expect(logger.debug).toHaveBeenCalled()
	})

	test('getFileActions() returned array is reactive', () => {
		logger.debug = vi.fn()

		const actions = getFileActions()
		// is empty for now
		expect(actions).toHaveLength(0)

		const action = new FileAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			exec: async () => true,
		})

		registerFileAction(action)

		// Now the array changed as it should be reactive
		expect(actions).toHaveLength(1)
		expect(actions[0]).toStrictEqual(action)
	})

	test('Duplicate FileAction gets rejected', () => {
		logger.error = vi.fn()
		const action = new FileAction({
			id: 'test',
			displayName: () => 'Test',
			iconSvgInline: () => '<svg></svg>',
			exec: async () => true,
		})

		registerFileAction(action)
		expect(getFileActions()).toHaveLength(1)
		expect(getFileActions()[0]).toStrictEqual(action)

		const action2 = new FileAction({
			id: 'test',
			displayName: () => 'Test 2',
			iconSvgInline: () => '<svg></svg>',
			exec: async () => true,
		})

		registerFileAction(action2)
		expect(getFileActions()).toHaveLength(1)
		expect(getFileActions()[0]).toStrictEqual(action)
		expect(logger.error).toHaveBeenCalledWith('FileAction test already registered', { action: action2 })
	})
})

describe('Invalid FileAction creation', () => {
	test('Invalid id', () => {
		expect(() => {
			new FileAction({
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
			} as any as FileAction)
		}).toThrowError('Invalid id')
	})
	test('Invalid displayName', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
			} as any as FileAction)
		}).toThrowError('Invalid displayName function')
	})
	test('Invalid title', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				title: 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
			} as any as FileAction)
		}).toThrowError('Invalid title function')
	})
	test('Invalid iconSvgInline', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: '<svg></svg>',
				exec: async () => true,
			} as any as FileAction)
		}).toThrowError('Invalid iconSvgInline function')
	})
	test('Invalid exec', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: false,
			} as any as FileAction)
		}).toThrowError('Invalid exec function')
	})
	test('Invalid enabled', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				enabled: false,
			} as any as FileAction)
		}).toThrowError('Invalid enabled function')
	})
	test('Invalid execBatch', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				execBatch: false,
			} as any as FileAction)
		}).toThrowError('Invalid execBatch function')
	})
	test('Invalid order', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				order: 'invalid',
			} as any as FileAction)
		}).toThrowError('Invalid order')
	})
	test('Invalid parent', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				parent: true,
			} as any as FileAction)
		}).toThrowError('Invalid parent')
	})
	test('Invalid default', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				default: 'invalid',
			} as any as FileAction)
		}).toThrowError('Invalid default')
	})
	test('Invalid inline', () => {
		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				inline: true,
			} as any as FileAction)
		}).toThrowError('Invalid inline function')

		expect(() => {
			new FileAction({
				id: 'test',
				displayName: () => 'Test',
				iconSvgInline: () => '<svg></svg>',
				exec: async () => true,
				inline: () => true,
				renderInline: false,
			} as any as FileAction)
		}).toThrowError('Invalid renderInline function')
	})
})

describe('FileActions creation', () => {
	test('create valid FileAction', async () => {
		logger.debug = vi.fn()
		const action = new FileAction({
			id: 'test',
			displayName: () => 'Test',
			title: () => 'Test title',
			iconSvgInline: () => '<svg></svg>',
			exec: async () => true,
			execBatch: async () => [true],
			enabled: () => true,
			order: 100,
			parent: '123',
			default: DefaultType.DEFAULT,
			inline: () => true,
			renderInline: async () => {
				const span = document.createElement('span')
				span.textContent = 'test'
				return span
			},
		})

		expect(action.id).toBe('test')
		expect(action.displayName([], {} as any)).toBe('Test')
		expect(action.title?.([], {} as any)).toBe('Test title')
		expect(action.iconSvgInline([], {} as any)).toBe('<svg></svg>')
		await expect(action.exec({} as any, {} as any, '/')).resolves.toBe(true)
		await expect(action.execBatch?.([], {} as any, '/')).resolves.toStrictEqual([true])
		expect(action.enabled?.({} as any, {} as any)).toBe(true)
		expect(action.order).toBe(100)
		expect(action.parent).toBe('123')
		expect(action.default).toBe(DefaultType.DEFAULT)
		expect(action.inline?.({} as any, {} as any)).toBe(true)
		expect((await action.renderInline?.({} as any, {} as any))?.outerHTML).toBe('<span>test</span>')
	})
})
