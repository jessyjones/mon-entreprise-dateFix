import { SimulationConfig } from './types'

export const configDividendes: SimulationConfig = {
	objectifs: [
		'bénéficiaire . dividendes . bruts',
		"bénéficiaire . dividendes . nets d'impôt",
	],
	questions: {
		// [TODO] [dividendes-indep]
		// à l'affiche:
		//   Régime social du dirigeant: dirigeant
		'liste noire': ['impôt . méthode de calcul'],
	},
	'unité par défaut': '€/an',
	situation: {
		bénéficiaire: 'oui',
		'entreprise . imposition': "'IS'",
		'impôt . méthode de calcul': "'PFU'",
		'dirigeant . rémunération . net . imposable': '0 €/an',
	},
}
