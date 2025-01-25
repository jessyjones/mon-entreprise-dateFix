import { Trans } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { styled } from 'styled-components'

import Banner from '@/components/Banner'
import { Link as DesignSystemLink } from '@/design-system/typography/link'
import { enregistreLaRéponse } from '@/store/actions/actions'

import useYear from './utils/useYear'

const Bold = styled.span<{ $bold: boolean }>`
	${({ $bold }) => ($bold ? 'font-weight: bold;' : '')}
`
const getYearsSince = (startYear: number, currentYear: number): number[] => {
  return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
};

export const SelectSimulationYear = () => {
	const dispatch = useDispatch()
	const currentYear = new Date().getFullYear(); 
	const choices = getYearsSince(2023,currentYear);

	const actualYear = useYear()

	// return null // Waiting for next year.

	return (
		<Banner hideAfterFirstStep={false} icon={'📅'}>
			<Trans i18nKey="pages.simulateurs.select-year.info">
				Cette simulation concerne l'année{' '}
				<Bold $bold={actualYear !== currentYear}>{{ actualYear }}</Bold>.{' '}
			</Trans>
			<>
				{choices
					.filter((year) => year !== actualYear)
					.map((year) => (
						<span key={year}>
							<DesignSystemLink
								onPress={() =>
									dispatch(enregistreLaRéponse('date', `01/01/${year}`))
								}
							>
								{actualYear === currentYear ? (
									<Trans i18nKey="pages.simulateurs.select-year.access">
										Accéder au simulateur {{ year }}
									</Trans>
								) : (
									<Trans i18nKey="pages.simulateurs.select-year.back">
										Retourner au simulateur {{ year }}
									</Trans>
								)}
							</DesignSystemLink>
						</span>
					))}
			</>
		</Banner>
	)
}
