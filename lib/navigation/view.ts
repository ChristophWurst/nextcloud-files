/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { Folder } from '../files/folder'
import type { Node } from '../files/node'
import isSvg from 'is-svg'

import { Column } from './column.js'

export type ContentsWithRoot = {
	folder: Folder,
	contents: Node[]
}

export interface ViewData {
	/** Unique view ID */
	id: string
	/** Translated view name */
	name: string
	/** Translated accessible description of the view */
	caption?: string

	/** Translated title of the empty view */
	emptyTitle?: string
	/** Translated description of the empty view */
	emptyCaption?: string

	/**
	 * Method return the content of the  provided path
	 * This ideally should be a cancellable promise.
	 * promise.cancel(reason) will be called when the directory
	 * change and the promise is not resolved yet.
	 * You _must_ also return the current directory
	 * information alongside with its content.
	 */
	getContents: (path: string) => Promise<ContentsWithRoot>
	/** The view icon as an inline svg */
	icon: string

	/**
	 * The view order.
	 * If not set will be natural sorted by view name.
	 */
	order?: number

	/**
	 * Custom params to give to the router on click
	 * If defined, will be treated as a dummy view and
	 * will just redirect and not fetch any contents.
	 */
	params?: Record<string, string>

	/**
	 * This view column(s). Name and actions are
	 * by default always included
	 */
	columns?: Column[]
	/** The empty view element to render your empty content into */
	emptyView?: (div: HTMLDivElement) => void
	/** The parent unique ID */
	parent?: string
	/** This view is sticky (sent at the bottom) */
	sticky?: boolean

	/**
	 * This view has children and is expanded (by default)
	 * or not. This will be overridden by user config.
	 */
	expanded?: boolean

	/**
	 * Will be used as default if the user
	 * haven't customized their sorting column
	 */
	defaultSortKey?: string

	/**
	 * Method called to load child views if any
	 * @param view This view (deprecated use `this` instead)
	 */
	// eslint-disable-next-line no-use-before-define
	loadChildViews?: (view: View) => Promise<void>
}

export class View implements ViewData {

	private _view: ViewData

	constructor(view: ViewData) {
		isValidView(view)
		this._view = view
	}

	get id() {
		return this._view.id
	}

	get name() {
		return this._view.name
	}

	get caption() {
		return this._view.caption
	}

	get emptyTitle() {
		return this._view.emptyTitle
	}

	get emptyCaption() {
		return this._view.emptyCaption
	}

	get getContents() {
		return this._view.getContents.bind(this._view)
	}

	get icon() {
		return this._view.icon
	}

	set icon(icon) {
		this._view.icon = icon
	}

	get order() {
		return this._view.order
	}

	set order(order) {
		this._view.order = order
	}

	get params() {
		return this._view.params
	}

	set params(params) {
		this._view.params = params
	}

	get columns() {
		return this._view.columns
	}

	get emptyView() {
		return this._view.emptyView?.bind(this._view)
	}

	get parent() {
		return this._view.parent
	}

	get sticky() {
		return this._view.sticky
	}

	get expanded() {
		return this._view.expanded
	}

	set expanded(expanded: boolean | undefined) {
		this._view.expanded = expanded
	}

	get defaultSortKey() {
		return this._view.defaultSortKey
	}

	get loadChildViews() {
		return this._view.loadChildViews?.bind(this._view)
	}

}

/**
 * Typescript cannot validate an interface.
 * Please keep in sync with the View interface requirements.
 *
 * @param {ViewData} view the view to check
 * @return {boolean} true if the column is valid
 * @throws {Error} if the view is not valid
 */
const isValidView = function(view: ViewData): boolean {
	if (!view.id || typeof view.id !== 'string') {
		throw new Error('View id is required and must be a string')
	}

	if (!view.name || typeof view.name !== 'string') {
		throw new Error('View name is required and must be a string')
	}

	if ('caption' in view && typeof view.caption !== 'string') {
		throw new Error('View caption must be a string')
	}

	if (!view.getContents || typeof view.getContents !== 'function') {
		throw new Error('View getContents is required and must be a function')
	}

	if (!view.icon || typeof view.icon !== 'string' || !isSvg(view.icon)) {
		throw new Error('View icon is required and must be a valid svg string')
	}

	if ('order' in view && typeof view.order !== 'number') {
		throw new Error('View order must be a number')
	}

	// Optional properties
	if (view.columns) {
		view.columns.forEach((column) => {
			if (!(column instanceof Column)) {
				throw new Error('View columns must be an array of Column. Invalid column found')
			}
		})
	}

	if (view.emptyView && typeof view.emptyView !== 'function') {
		throw new Error('View emptyView must be a function')
	}

	if (view.parent && typeof view.parent !== 'string') {
		throw new Error('View parent must be a string')
	}

	if ('sticky' in view && typeof view.sticky !== 'boolean') {
		throw new Error('View sticky must be a boolean')
	}

	if ('expanded' in view && typeof view.expanded !== 'boolean') {
		throw new Error('View expanded must be a boolean')
	}

	if (view.defaultSortKey && typeof view.defaultSortKey !== 'string') {
		throw new Error('View defaultSortKey must be a string')
	}

	if (view.loadChildViews && typeof view.loadChildViews !== 'function') {
		throw new Error('View loadChildViews must be a function')
	}

	return true
}
