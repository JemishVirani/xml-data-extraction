export type IParsedXmlData = {
	[key: string]:
		| { $?: { [key: string]: string }; _?: string }
		| IParsedXmlData
		| Array<{ $?: { [key: string]: string }; _?: string } | IParsedXmlData>
		| undefined;
};

export type IXmlExtractionConfig = {
	[key: string]: {
		attributes?: Record<string, boolean>;
	} & ({ value?: boolean } | { value?: never; child: IXmlExtractionConfig });
};

// Corrected dynamic output type based on your actual output
export type XmlExtractionOutput<T extends IXmlExtractionConfig> = {
	[K in keyof T]: TransformNode<T[K]> | null;
};

// Transform each node based on its structure
type TransformNode<T> = T extends { value: boolean; attributes?: infer A }
	? // Leaf node: has value + optional attributes in nested object
	  A extends Record<string, boolean>
		? { attributes: { [K in keyof A]: string | null }; value: string | null }
		: { value: string | null }
	: T extends { child: infer C; attributes?: infer A }
	? // Parent node: has children as arrays + optional attributes in nested object
	  (A extends Record<string, boolean>
			? { attributes: { [K in keyof A]: string | null } }
			: {}) &
			(C extends IXmlExtractionConfig ? TransformChildrenToArrays<C> : {})
	: never;

// Transform children into arrays
type TransformChildrenToArrays<T extends IXmlExtractionConfig> = {
	[K in keyof T]: Array<TransformNode<T[K]>> | null;
};

/* Examples */

const dummyXml = `
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="RON">0.00</cbc:TaxAmount>
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="RON">0.00</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="RON">0.00</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>19</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>
</cac:TaxTotal>
`;

const config = {
	'TaxTotal': {
		child: {
			'TaxAmount': {
				attributes: {
					currencyID: true,
				},
				value: true,
			},
			'TaxSubtotal': {
				child: {
					'TaxableAmount': {
						attributes: {
							currencyID: true,
						},
						value: true,
					},
				},
			},
		},
	},
} satisfies IXmlExtractionConfig;

type IDynamicOutput = XmlExtractionOutput<typeof config>;
const output: IDynamicOutput = {
	TaxTotal: {
		TaxAmount: [{ attributes: { currencyID: 'RON' }, value: '11.00' }],
		TaxSubtotal: [
			{
				TaxableAmount: [{ attributes: { currencyID: 'RON' }, value: '11.00' }],
			},
		],
	},
};
