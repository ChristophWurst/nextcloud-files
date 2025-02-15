/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/* eslint-disable no-new */
import { describe, expect, test, beforeEach, vi } from 'vitest'

import { Folder } from '../lib/files/folder'
import { Header, getFileListHeaders, registerFileListHeaders } from '../lib/fileListHeaders'
import { View } from '../lib/navigation/view'
import logger from '../lib/utils/logger'

describe('FileListHeader init', () => {

	beforeEach(() => {
		delete window._nc_filelistheader
	})

	test('Getting empty uninitialized FileListHeader', () => {
		logger.debug = vi.fn()
		const headers = getFileListHeaders()
		expect(window._nc_filelistheader).toBeDefined()
		expect(headers).toHaveLength(0)
		expect(logger.debug).toHaveBeenCalledTimes(1)
	})

	test('Initializing FileListHeader', () => {
		logger.debug = vi.fn()
		const header = new Header({
			id: 'test',
			order: 1,
			enabled: () => true,
			render: () => {},
			updated: () => {},
		})

		expect(header.id).toBe('test')
		expect(header.order).toBe(1)
		expect(header.enabled!({} as Folder, {} as View)).toBe(true)

		registerFileListHeaders(header)

		expect(window._nc_filelistheader).toHaveLength(1)
		expect(getFileListHeaders()).toHaveLength(1)
		expect(getFileListHeaders()[0]).toStrictEqual(header)
		expect(logger.debug).toHaveBeenCalled()
	})

	test('getFileListHeaders() returned array is reactive', () => {
		logger.debug = vi.fn()

		const headers = getFileListHeaders()
		// is empty for now
		expect(headers).toHaveLength(0)

		const header = new Header({
			id: 'test',
			order: 1,
			enabled: () => true,
			render: () => {},
			updated: () => {},
		})

		registerFileListHeaders(header)

		// Now the array changed as it should be reactive
		expect(headers).toHaveLength(1)
		expect(headers[0]).toStrictEqual(header)
	})

	test('Duplicate Header gets rejected', () => {
		logger.error = vi.fn()
		const header = new Header({
			id: 'test',
			order: 1,
			render: () => {},
			updated: () => {},
		})

		registerFileListHeaders(header)
		expect(getFileListHeaders()).toHaveLength(1)
		expect(getFileListHeaders()[0]).toStrictEqual(header)

		const header2 = new Header({
			id: 'test',
			order: 2,
			render: () => {},
			updated: () => {},
		})

		registerFileListHeaders(header2)
		expect(getFileListHeaders()).toHaveLength(1)
		expect(getFileListHeaders()[0]).toStrictEqual(header)
		expect(logger.error).toHaveBeenCalledWith('Header test already registered', { header: header2 })
	})
})

describe('FileListHeader validate', () => {
	test('Missing required props', () => {
		expect(() => {
			new Header({
				id: null,
				render: () => {},
				updated: () => {},
			} as unknown as Header)
		}).toThrowError('Invalid header: id, render and updated are required')

		expect(() => {
			new Header({
				id: '123',
				render: null,
				updated: () => {},
			} as unknown as Header)
		}).toThrowError('Invalid header: id, render and updated are required')

		expect(() => {
			new Header({
				id: '123',
				render: () => {},
				updated: null,
			} as unknown as Header)
		}).toThrowError('Invalid header: id, render and updated are required')
	})
	test('Invalid id', () => {
		expect(() => {
			new Header({
				id: true,
				render: () => {},
				updated: () => {},
			} as unknown as Header)
		}).toThrowError('Invalid id property')
	})
	test('Invalid enabled', () => {
		expect(() => {
			new Header({
				id: 'test',
				enabled: true,
				render: () => {},
				updated: () => {},
			} as unknown as Header)
		}).toThrowError('Invalid enabled property')
	})
	test('Invalid render', () => {
		expect(() => {
			new Header({
				id: 'test',
				enabled: () => {},
				render: true,
				updated: () => {},
			} as unknown as Header)
		}).toThrowError('Invalid render property')
	})
	test('Invalid updated', () => {
		expect(() => {
			new Header({
				id: 'test',
				enabled: () => {},
				render: () => {},
				updated: true,
			} as unknown as Header)
		}).toThrowError('Invalid updated property')
	})
})

describe('FileListHeader exec', () => {

	test('Initializing FileListHeader', () => {
		const enabled = vi.fn()
		const render = vi.fn()
		const updated = vi.fn()

		const header = new Header({
			id: 'test',
			order: 1,
			enabled,
			render,
			updated,
		})

		expect(header.enabled).toBe(enabled)
		expect(header.render).toBe(render)
		expect(header.updated).toBe(updated)

		header.enabled!({} as Folder, {} as View)
		header.render({} as HTMLElement, {} as Folder, {} as View)
		header.updated({} as Folder, {} as View)

		expect(enabled).toHaveBeenCalled()
		expect(render).toHaveBeenCalled()
		expect(updated).toHaveBeenCalled()
	})
})
