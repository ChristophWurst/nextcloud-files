/**
 * SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { XMLValidator } from 'fast-xml-parser'

import {
	defaultDavNamespaces,
	defaultDavProperties,
	getDavNameSpaces,
	getDavProperties,
	getDefaultPropfind,
	getFavoritesReport,
	getRecentSearch,
	registerDavProperty,
} from '../../lib/dav/davProperties'

import logger from '../../lib/utils/logger'

declare global {
	interface Window {
		_nc_dav_namespaces?: string[]
		_nc_dav_properties?: string[]
	}
}

describe('DAV Properties', () => {

	beforeEach(() => {
		delete window._nc_dav_properties
		delete window._nc_dav_namespaces

		logger.error = vi.fn()
		logger.warn = vi.fn()
	})

	test('getDavNameSpaces fall back to defaults', () => {
		expect(window._nc_dav_namespaces).toBeUndefined()
		const namespace = getDavNameSpaces()
		expect(namespace).toBeTruthy()
		Object.keys(defaultDavNamespaces).forEach(n => expect(namespace.includes(n) && namespace.includes(defaultDavNamespaces[n])).toBe(true))
	})

	test('getDavProperties fall back to defaults', () => {
		expect(window._nc_dav_properties).toBeUndefined()
		const props = getDavProperties()
		expect(props).toBeTruthy()
		defaultDavProperties.forEach(p => expect(props.includes(p)).toBe(true))
	})

	test('getDefaultPropfind', () => {
		expect(typeof getDefaultPropfind()).toBe('string')
		expect(XMLValidator.validate(getDefaultPropfind())).toBe(true)
	})

	test('getFavoritesReport', () => {
		expect(typeof getFavoritesReport()).toBe('string')
		expect(XMLValidator.validate(getFavoritesReport())).toBe(true)
	})

	test('getFavoritesReport', () => {
		expect(typeof getRecentSearch(1337)).toBe('string')
		expect(XMLValidator.validate(getRecentSearch(1337))).toBe(true)
	})

	test('registerDavProperty registers successfully', () => {
		expect(window._nc_dav_namespaces).toBeUndefined()
		expect(window._nc_dav_properties).toBeUndefined()

		expect(registerDavProperty('my:prop', { my: 'https://example.com/ns' })).toBe(true)
		expect(logger.warn).not.toBeCalled()
		expect(logger.error).not.toBeCalled()
		expect(getDavProperties().includes('my:prop')).toBe(true)
		expect(getDavNameSpaces().includes('xmlns:my="https://example.com/ns"')).toBe(true)
	})

	test('registerDavProperty fails when registered multiple times', () => {
		expect(window._nc_dav_namespaces).toBeUndefined()
		expect(window._nc_dav_properties).toBeUndefined()

		expect(registerDavProperty('my:prop', { my: 'https://example.com/ns' })).toBe(true)
		expect(registerDavProperty('my:prop')).toBe(false)
		expect(logger.warn).toBeCalled()
		expect(logger.error).not.toBeCalled()
		// but still included
		expect(getDavProperties().includes('my:prop')).toBe(true)
		expect(getDavNameSpaces().includes('xmlns:my="https://example.com/ns"')).toBe(true)
	})

	test('registerDavProperty fails with invalid props', () => {
		expect(window._nc_dav_namespaces).toBeUndefined()
		expect(window._nc_dav_properties).toBeUndefined()

		expect(registerDavProperty('my:prop:invalid', { my: 'https://example.com/ns' })).toBe(false)
		expect(logger.error).toBeCalled()
		expect(logger.warn).not.toBeCalled()
		expect(getDavProperties().includes('my:prop')).toBe(false)

		expect(registerDavProperty('<my:prop />', { my: 'https://example.com/ns' })).toBe(false)
		expect(logger.error).toBeCalled()
		expect(logger.warn).not.toBeCalled()
		expect(getDavProperties().includes('my:prop')).toBe(false)
	})

	test('registerDavProperty fails with missing namespace', () => {
		expect(window._nc_dav_namespaces).toBeUndefined()
		expect(window._nc_dav_properties).toBeUndefined()

		expect(registerDavProperty('my:prop', { other: 'https://example.com/ns' })).toBe(false)
		expect(logger.error).toBeCalled()
		expect(logger.warn).not.toBeCalled()
		expect(getDavProperties().includes('my:prop')).toBe(false)
	})

	test('default properties include all RFC DAV properties', () => {
		// Refer to http://www.webdav.org/specs/rfc2518.html#dav.properties
		const rfc2518 = [
			'd:creationdate',
			'd:displayname',
			'd:getcontentlength',
			'd:getcontenttype',
			'd:getetag',
			'd:getlastmodified',
			'd:resourcetype',
			// Nextcloud automatically includes:
			// 'd:source'
			// Only valid for GET requests
			// 'd:getcontentlanguage',
			// Not used by default (stub implemented)
			// 'd:supportedlock'
			// 'd:lockdiscovery'
		]

		const missing = rfc2518.filter((prop) => !defaultDavProperties.includes(prop))
		expect(missing, 'RFC defined prop not included in default DAV properties').toEqual([])
	})
})
