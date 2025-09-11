import xml2js from 'xml2js';
import {
	IParsedXmlData,
	IXmlExtractionConfig,
	XmlExtractionOutput,
} from './types/extract';
import fs from 'fs';

const parseXmlData = async (
	xml: string,
	options?: Omit<xml2js.ParserOptions, 'explicitArray'>
): Promise<IParsedXmlData> => {
	try {
		// parse the XML string into an object
		const data = await xml2js.parseStringPromise(xml, {
			explicitArray: true,
			explicitCharkey: true,
			...options,
		});
		return data;
	} catch (error) {
		throw error;
	}
};

export const extractConfigParametersFromParsedXml = <
	T extends IXmlExtractionConfig
>(
	xmlData: IParsedXmlData,
	config: T
): XmlExtractionOutput<T> => {
	const processNode = <C extends IXmlExtractionConfig>(
		data: any,
		cfg: C[string]
	): XmlExtractionOutput<C>[keyof XmlExtractionOutput<C>] | null => {
		if (!data) return null;

		// Handle value + attributes case
		if ('value' in cfg) {
			const attributes =
				'attributes' in cfg && cfg.attributes
					? Object.fromEntries(
							Object.keys(cfg.attributes).map((key) => [
								key,
								(data.$?.[key] ?? null) as string | null,
							])
					  )
					: undefined;

			return {
				...(attributes ? { attributes } : {}),
				value: (data._ ?? null) as string | null,
			} as any;
		}

		// Handle children + optional attributes
		if ('child' in cfg) {
			const childrenConfig = cfg.child;
			const attributes =
				'attributes' in cfg && cfg.attributes
					? Object.fromEntries(
							Object.keys(cfg.attributes).map((key) => [
								key,
								(data.$?.[key] ?? null) as string | null,
							])
					  )
					: undefined;

			const children = Object.fromEntries(
				Object.keys(childrenConfig).map((childKey) => {
					const childDataArray = Array.isArray(data[childKey])
						? data[childKey]
						: data[childKey]
						? [data[childKey]]
						: [];

					const extracted = childDataArray.length
						? childDataArray.map((c) =>
								processNode(c, childrenConfig[childKey])
						  )
						: null;

					return [childKey, extracted];
				})
			);

			return {
				...(attributes ? { attributes } : {}),
				...children,
			} as any;
		}

		return null;
	};

	const output = Object.fromEntries(
		Object.keys(config).map((key) => [
			key,
			processNode(xmlData[key], config[key]),
		])
	);

	return output as XmlExtractionOutput<T>;
};

const parseDummyXml = async () => {
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

	const parsedData = await parseXmlData(dummyXml, {
		tagNameProcessors: [
			(name) =>
				name.startsWith('cac:')
					? name.replace('cac:', '')
					: name.replace('cbc:', ''),
		],
	});
	console.dir(parsedData, { depth: null });

	const output1 = extractConfigParametersFromParsedXml(parsedData, config);

	console.dir(output1, { depth: null });
};

const parseD100XmlFile = async () => {
	const filePath = 'files/D100.xml';
	const xmlStr = fs.readFileSync(filePath, { encoding: 'utf-8' });

	const config = {
		'declaratie100': {
			attributes: { luna: true, an: true, cui: true },
			child: {
				obligatie: {
					attributes: {
						cod_oblig: true,
						cod_bugetar: true,
						scadenta: true,
						suma_plata: true,
					},
					value: true,
				},
			},
		},
	} satisfies IXmlExtractionConfig;

	const parsedData = await parseXmlData(xmlStr);
	// console.dir(parsedData, { depth: null });

	const output1 = extractConfigParametersFromParsedXml(parsedData, config);
	console.dir(output1, { depth: null });
};

const d406ParametersConfig = {
	'AuditFile': {
		'MasterFiles': {
			'GeneralLedgerAccounts': {
				'Account': {
					'OpeningCreditBalance': true,
					'ClosingCreditBalance': true,
					'OpeningDebitBalance': true,
					'ClosingDebitBalance': true,
				},
			},
			'TaxTable': {
				'TaxTableEntry': {
					'TaxCodeDetails': {
						'TaxCode': true,
						'TaxPercentage': true,
					},
				},
			},
			'Suppliers': {
				'Supplier': {
					'CompanyStructure': {
						'RegistrationNumber': true,
						'Name': true,
					},
				},
			},
		},
		'SourceDocuments': {
			'SalesInvoices': {
				'Invoice': {
					'InvoiceNo': true,
					'InvoiceDate': true,
					'InvoiceLine': {
						'LineNumber': true,
						'InvoiceLineAmount': {
							'Amount': true,
						},
						'TaxInformation': {
							'TaxCode': true,
							'TaxPercentage': true,
							'TaxAmount': {
								'Amount': true,
							},
						},
					},
				},
			},
			'PurchaseInvoices': {
				'Invoice': {
					'InvoiceNo': true,
					'SupplierInfo': {
						'SupplierID': true,
					},
					'InvoiceLine': {
						'LineNumber': true,
						'ProductDescription': true,
						'InvoiceLineAmount': {
							'Amount': true,
						},
						'TaxInformation': {
							'TaxType': true,
							'TaxCode': true,
							'TaxAmount': {
								'Amount': true,
							},
						},
					},
				},
			},
		},
	},
};

const parseD406XmlFile = async () => {
	const filePath = 'files/bigger-D406.xml';
	const xmlStr = fs.readFileSync(filePath, { encoding: 'utf-8' });

	const config = {
		'AuditFile': {
			child: {
				'MasterFiles': {
					child: {
						'GeneralLedgerAccounts': {
							child: {
								'Account': {
									child: {
										'OpeningCreditBalance': { value: true },
										'ClosingCreditBalance': { value: true },
										'OpeningDebitBalance': { value: true },
										'ClosingDebitBalance': { value: true },
									},
								},
							},
						},
						'TaxTable': {
							child: {
								'TaxTableEntry': {
									child: {
										'TaxCodeDetails': {
											child: {
												'TaxCode': { value: true },
												'TaxPercentage': { value: true },
											},
										},
									},
								},
							},
						},
						'Suppliers': {
							child: {
								'Supplier': {
									child: {
										'CompanyStructure': {
											child: {
												'RegistrationNumber': { value: true },
												'Name': { value: true },
											},
										},
									},
								},
							},
						},
					},
				},
				'SourceDocuments': {
					child: {
						'SalesInvoices': {
							child: {
								'Invoice': {
									child: {
										'InvoiceNo': { value: true },
										'InvoiceDate': { value: true },
										'InvoiceLine': {
											child: {
												'LineNumber': { value: true },
												'InvoiceLineAmount': {
													child: {
														'Amount': { value: true },
													},
												},
												'TaxInformation': {
													child: {
														'TaxCode': { value: true },
														'TaxPercentage': { value: true },
														'TaxAmount': {
															child: {
																'Amount': { value: true },
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
						'PurchaseInvoices': {
							child: {
								'Invoice': {
									child: {
										'InvoiceNo': { value: true },
										'SupplierInfo': {
											child: {
												'SupplierID': { value: true },
											},
										},
										'InvoiceLine': {
											child: {
												'LineNumber': { value: true },
												'ProductDescription': {
													value: true,
												},
												'InvoiceLineAmount': {
													child: {
														'Amount': { value: true },
													},
												},
												'TaxInformation': {
													child: {
														'TaxType': { value: true },
														'TaxCode': { value: true },
														'TaxAmount': {
															child: {
																'Amount': { value: true },
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	} satisfies IXmlExtractionConfig;

	console.time('parseTime');
	const parsedData = await parseXmlData(xmlStr, {
		tagNameProcessors: [
			(name) =>
				name.startsWith('nsSAFT:') ? name.replace('nsSAFT:', '') : name,
		],
	});
	console.timeEnd('parseTime');

	console.time('extractTime');
	const output1 = extractConfigParametersFromParsedXml(parsedData, config);
	console.timeEnd('extractTime');

	// console.dir(output1, { depth: null });
};

const extractData = async () => {
	try {
		await parseD406XmlFile();
	} catch (error) {
		console.log(error);
	}
};

extractData();
