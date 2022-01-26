import { OverlayProvider } from '@react-aria/overlays'
import { ErrorBoundary } from '@sentry/react'
import { ThemeColorsProvider } from 'Components/utils/colors'
import { DisableAnimationOnPrintProvider } from 'Components/utils/DisableAnimationContext'
import { IsEmbeddedProvider } from 'Components/utils/embeddedContext'
import { SitePathProvider, SitePaths } from 'Components/utils/SitePathsContext'
import { GlobalStyle } from 'DesignSystem/global-style'
import { Container } from 'DesignSystem/layout'
import DesignSystemThemeProvider from 'DesignSystem/root'
import { H1 } from 'DesignSystem/typography/heading'
import { Link } from 'DesignSystem/typography/link'
import { Body, Intro } from 'DesignSystem/typography/paragraphs'
import { createBrowserHistory } from 'history'
import i18next from 'i18next'
import 'iframe-resizer'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { Router } from 'react-router-dom'
import reducers, { RootState } from 'Reducers/rootReducer'
import {
	applyMiddleware,
	compose,
	createStore,
	Middleware,
	PreloadedState,
	Store,
} from 'redux'
// ATInternet Tracking
import { TrackingContext } from './ATInternetTracking'
import { createTracker } from './ATInternetTracking/Tracker'
import logo from './static/images/logo-monentreprise.svg'
import safeLocalStorage from './storage/safeLocalStorage'
import { inIframe } from './utils'

const ATTracker = createTracker(
	process.env.AT_INTERNET_SITE_ID,
	safeLocalStorage.getItem('tracking:do_not_track') === '1' ||
		navigator.doNotTrack === '1'
)

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
	}
}
if (process.env.REDUX_TRACE) {
	console.log('going to trace')
}
const composeEnhancers =
	(process.env.REDUX_TRACE
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
		  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
				trace: true,
				traceLimit: 25,
		  })
		: window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

if (
	process.env.NODE_ENV === 'production' &&
	'serviceWorker' in navigator &&
	!inIframe()
) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				// eslint-disable-next-line no-console
				console.log('SW registered: ', registration)
			})
			.catch((registrationError) => {
				// eslint-disable-next-line no-console
				console.log('SW registration failed: ', registrationError)
			})
	})
}

type SiteName = 'mon-entreprise' | 'infrance' | 'publicodes'

export const SiteNameContext = createContext<SiteName | null>(null)

export type ProviderProps = {
	basename: SiteName
	children: React.ReactNode
	sitePaths?: SitePaths
	initialStore?: PreloadedState<RootState>
	onStoreCreated?: (store: Store) => void
	reduxMiddlewares?: Array<Middleware>
}

const HideLoader = () => {
	const [CSS, setCSS] = useState<string>()
	// Remove loader when page is load
	useEffect(() => {
		setCSS(`
		#js {
			animation: appear 0.5s;
			opacity: 1;
		}
		#loading {
			display: none !important;
		}`)
	}, [])

	return <style>{CSS}</style>
}

export default function Provider({
	basename,
	reduxMiddlewares = [],
	initialStore,
	onStoreCreated,
	children,
	sitePaths = {} as SitePaths,
}: ProviderProps) {
	const history = useMemo(
		() =>
			createBrowserHistory({
				basename: process.env.NODE_ENV === 'production' ? '' : basename,
			}),
		[]
	)

	const storeEnhancer = composeEnhancers(applyMiddleware(...reduxMiddlewares))

	// Hack: useMemo is used to persist the store across hot reloads.
	const store = useMemo(() => {
		return createStore(reducers, initialStore, storeEnhancer)
	}, [])
	onStoreCreated?.(store)

	return (
		<DesignSystemThemeProvider>
			<HideLoader />
			<GlobalStyle />
			<ErrorBoundary
				showDialog
				fallback={
					<>
						<Container>
							<Link to={sitePaths.index}>
								<img
									src={logo}
									alt="logo service mon-entreprise urssaf"
									style={{
										maxWidth: '200px',
										width: '100%',
										marginTop: '1rem',
									}}
								></img>
							</Link>
							<H1>Une erreur est survenue</H1>
							<Intro>
								L'équipe technique mon-entreprise a été automatiquement
								prévenue.
							</Intro>
							<Body>
								Vous pouvez également nous contacter directement à l'adresse{' '}
								<Link href="mailto:contact@mon-entreprise.beta.gouv.fr">
									contact@mon-entreprise.beta.gouv.fr
								</Link>{' '}
								si vous souhaitez partager une remarque. Veuillez nous excuser
								pour la gêne occasionnée.
							</Body>
						</Container>
					</>
				}
			>
				<OverlayProvider
					css={`
						flex: 1;
						display: flex;
						flex-direction: column;
					`}
				>
					<ReduxProvider store={store}>
						<IsEmbeddedProvider>
							<ThemeColorsProvider>
								<TrackingContext.Provider
									value={
										new ATTracker({
											language: i18next.language as 'fr' | 'en',
										})
									}
								>
									<DisableAnimationOnPrintProvider>
										<SiteNameContext.Provider value={basename}>
											<SitePathProvider value={sitePaths}>
												<I18nextProvider i18n={i18next}>
													<HelmetProvider>
														<Router history={history}>
															<>{children}</>
														</Router>
													</HelmetProvider>
												</I18nextProvider>
											</SitePathProvider>
										</SiteNameContext.Provider>
									</DisableAnimationOnPrintProvider>
								</TrackingContext.Provider>
							</ThemeColorsProvider>
						</IsEmbeddedProvider>
					</ReduxProvider>
				</OverlayProvider>
			</ErrorBoundary>
		</DesignSystemThemeProvider>
	)
}
