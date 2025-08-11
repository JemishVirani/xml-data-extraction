export enum DocumentTypeParameterType {
	Text = 'text',
	Number = 'number',
	Date = 'date',
}

export type DocumentTypeParameter = {
	name: string;
	type: DocumentTypeParameterType;
};

export type IParametersExtractionStructure = {
	singleKeys: DocumentTypeParameter[] | null;
	childParentKeys: Record<string, DocumentTypeParameter[]> | null;
};

export const documentType100ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: null,
	childParentKeys: {
		obligatie: [
			{
				name: 'cod_oblig',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'cod_bugetar',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'suma_plata',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'scadenta',
				type: DocumentTypeParameterType.Text,
			},
		],
	},
};

export const documentType710ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: null,
	childParentKeys: {
		obligatie: [
			{
				name: 'cod_oblig',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'cod_bugetar',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'suma_plata_C',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'scadenta',
				type: DocumentTypeParameterType.Text,
			},
		],
	},
};

export const documentType101ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'P52',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentType301ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'tva1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'tva2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'tva3',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'tva4',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentType300ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'R35_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R37_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R38_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R39_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R40_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R41_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R42_2',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'solicit_ramb',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R1_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R2_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R3_1_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R4_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R5_1_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R6_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R7_1_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'R8_1',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'totalPlata_A',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentType390ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'bazaA',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'bazaL',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'bazaT',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'bazaP',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'bazaS',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'luna',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentType311ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'OB_52',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentType112ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: {
		angajatorA: [
			{
				name: 'A_codOblig',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'A_codBugetar',
				type: DocumentTypeParameterType.Text,
			},
			{
				name: 'A_plata',
				type: DocumentTypeParameterType.Text,
			},
		],
	},
};

export const documentTypeF4109ExtractionKeys: IParametersExtractionStructure = {
	singleKeys: [
		{
			name: 'nui',
			type: DocumentTypeParameterType.Text,
		},
		{
			name: 'd_rec',
			type: DocumentTypeParameterType.Text,
		},
	],
	childParentKeys: null,
};

export const documentTypesParameterExtractionMap: Record<
	string,
	IParametersExtractionStructure | null
> = {
	'D100': documentType100ExtractionKeys,
	'D101': documentType101ExtractionKeys,
	'D301': documentType301ExtractionKeys,
	'D300': documentType300ExtractionKeys,
	'D311': documentType311ExtractionKeys,
	'D112': documentType112ExtractionKeys,
	'D390': documentType390ExtractionKeys,
	'D710': documentType710ExtractionKeys,
	'F4109': documentTypeF4109ExtractionKeys,
};
