import xml2js, { Builder } from 'xml2js';
import {
	IParentChildParametersData,
	IParsedXmlData,
	ISingleKeyParametersData,
	IXmlConfigParametersData,
	IXmlParametersExtractionConfig,
} from './types/xml';
import { DocumentTypeParameter } from './utils/xml-extraction-params';

const parseXmlData = async (
	xml: string,
	options?: Omit<xml2js.ParserOptions, 'explicitArray'>
): Promise<IParsedXmlData> => {
	try {
		// parse the XML string into an object
		const data = await xml2js.parseStringPromise(xml, {
			explicitArray: true,
			...options,
		});
		return data;
	} catch (error) {
		throw error;
	}
};

export const extractSingleKeyValuesFromXml = (
	xmlObject: IParsedXmlData,
	key: string
) => {
	let values: string[] = [];
	for (let prop in xmlObject) {
		// If the current property matches the key, add it to the values list
		if (prop === key && typeof xmlObject[prop] === 'string') {
			values.push(xmlObject[prop]);
		}

		if (prop === key && Array.isArray(xmlObject[prop])) {
			const stringValues = xmlObject[prop].filter(
				(item) => typeof item === 'string'
			);
			values = values.concat(stringValues);
		}
		if (typeof xmlObject[prop] === 'object' && Array.isArray(xmlObject[prop])) {
			const objectNodes = xmlObject[prop].filter(
				(item) => typeof item === 'object'
			);
			objectNodes.forEach((node) => {
				values = values.concat(extractSingleKeyValuesFromXml(node, key));
			});
		}
		// If the current property is an object, recurse into it
		if (
			typeof xmlObject[prop] === 'object' &&
			!Array.isArray(xmlObject[prop])
		) {
			values = values.concat(
				extractSingleKeyValuesFromXml(xmlObject[prop], key)
			);
		}
	}
	return values;
};

export const extractParentChildValuesFromXml = (
	xmlObject: IParsedXmlData,
	parentKey: string,
	childKeys: string[]
): Record<string, string | null>[] => {
	let values: Record<string, string | null>[] = [];

	for (let prop in xmlObject) {
		// Handle the case when parentKey is an array of objects
		if (prop === parentKey && Array.isArray(xmlObject[prop])) {
			xmlObject[prop].forEach((item: any) => {
				const row: Record<string, string | null> = {};

				childKeys.forEach((childKey) => {
					if (item.$ && item.$[childKey]) {
						row[childKey] = item.$[childKey];
					} else if (item.$ && !item.$[childKey]) {
						row[childKey] = null;
					}
				});

				if (Object.keys(row).length > 0) {
					values.push(row);
				}
			});
		}

		// Handle the case when parentKey is a single object (not in array)
		if (
			prop === parentKey &&
			typeof xmlObject[prop] === 'object' &&
			!Array.isArray(xmlObject[prop])
		) {
			const parentValue = xmlObject[prop];
			const row: Record<string, string> = {};

			childKeys.forEach((childKey) => {
				if (parentValue.$ && parentValue.$[childKey]) {
					row[childKey] = parentValue.$[childKey];
				}
			});

			if (Object.keys(row).length > 0) {
				values.push(row);
			}
		}

		// If the current property is an array, recurse only the objects of the array
		if (typeof xmlObject[prop] === 'object' && Array.isArray(xmlObject[prop])) {
			const objectNodes = xmlObject[prop].filter(
				(item) => typeof item === 'object'
			);
			objectNodes.forEach((node) => {
				values = values.concat(
					extractParentChildValuesFromXml(node, parentKey, childKeys)
				);
			});
		}
		// If the current property is an object, recurse into it
		if (
			typeof xmlObject[prop] === 'object' &&
			!Array.isArray(xmlObject[prop])
		) {
			values = values.concat(
				extractParentChildValuesFromXml(xmlObject[prop], parentKey, childKeys)
			);
		}
	}

	return values;
};

const extractSingleKeyParametersService = (
	xmlData: IParsedXmlData,
	singleKeys: DocumentTypeParameter[] | null
): ISingleKeyParametersData | null => {
	if (!singleKeys || !singleKeys.length) return null;

	const result: ISingleKeyParametersData = {};
	for (const parameter of singleKeys) {
		const parameterData = extractSingleKeyValuesFromXml(
			xmlData,
			parameter.name
		);
		result[parameter.name] = parameterData.length ? parameterData : null;
	}
	return result;
};

const extractParentChildKeyParametersService = (
	xmlData: IParsedXmlData,
	childParentKeys: Record<string, DocumentTypeParameter[]> | null
): IParentChildParametersData | null => {
	if (!childParentKeys) return null;

	const result: IParentChildParametersData = {};
	for (const parentKey in childParentKeys) {
		const childKeys = childParentKeys[parentKey].map(
			(childData) => childData.name
		);
		const parameterData = extractParentChildValuesFromXml(
			xmlData,
			parentKey,
			childKeys
		);
		result[parentKey] = parameterData.length ? parameterData : null;
	}
	return result;
};

const d406ParametersConfig: IXmlParametersExtractionConfig = {
	'nsSAFT:AuditFile': {
		'nsSAFT:MasterFiles': {
			'nsSAFT:GeneralLedgerAccounts': {
				'nsSAFT:Account': {
					'nsSAFT:OpeningCreditBalance': true,
					'nsSAFT:ClosingCreditBalance': true,
					'nsSAFT:OpeningDebitBalance': true,
					'nsSAFT:ClosingDebitBalance': true,
				},
			},
			'nsSAFT:TaxTable': {
				'nsSAFT:TaxTableEntry': {
					'nsSAFT:TaxCodeDetails': {
						'nsSAFT:TaxCode': true,
						'nsSAFT:TaxPercentage': true,
					},
				},
			},
			'nsSAFT:Customers': {
				'nsSAFT:Customer': {
					'nsSAFT:CompanyStructure': {
						'nsSAFT:RegistrationNumber': true,
						'nsSAFT:Name': true,
					},
				},
			},
			'nsSAFT:Suppliers': {
				'nsSAFT:Supplier': {
					'nsSAFT:CompanyStructure': {
						'nsSAFT:RegistrationNumber': true,
						'nsSAFT:Name': true,
					},
				},
			},
		},
		'nsSAFT:SourceDocuments': {
			'nsSAFT:SalesInvoices': {
				'nsSAFT:Invoice': {
					'nsSAFT:InvoiceNo': true,
					'nsSAFT:InvoiceDate': true,
					'nsSAFT:InvoiceLine': {
						'nsSAFT:LineNumber': true,
						'nsSAFT:InvoiceLineAmount': {
							'nsSAFT:Amount': true,
						},
						'nsSAFT:TaxInformation': {
							'nsSAFT:TaxCode': true,
							'nsSAFT:TaxPercentage': true,
							'nsSAFT:TaxAmount': {
								'nsSAFT:Amount': true,
							},
						},
					},
				},
			},
			'nsSAFT:PurchaseInvoices': {
				'nsSAFT:Invoice': {
					'nsSAFT:InvoiceNo': true,
					'nsSAFT:SupplierInfo': {
						'nsSAFT:SupplierID': true,
					},
					'nsSAFT:InvoiceLine': {
						'nsSAFT:LineNumber': true,
						'nsSAFT:ProductDescription': true,
						'nsSAFT:InvoiceLineAmount': {
							'nsSAFT:Amount': true,
						},
						'nsSAFT:TaxInformation': {
							'nsSAFT:TaxType': true,
							'nsSAFT:TaxCode': true,
							'nsSAFT:TaxAmount': {
								'nsSAFT:Amount': true,
							},
						},
					},
				},
			},
		},
	},
};

export const extractConfigParametersFromParsedXml = (
	xmlData: IParsedXmlData,
	config: IXmlParametersExtractionConfig
): IXmlConfigParametersData => {
	let result: IXmlConfigParametersData = {};

	function recursiveExtract(
		currentObj: IParsedXmlData,
		currentConfig: IXmlParametersExtractionConfig,
		parentPath: string = ''
	): void {
		if (!currentObj || typeof currentObj !== 'object') return;

		for (const key in currentConfig) {
			const fullPath = parentPath ? `${parentPath}.${key}` : key;

			if (currentObj[key] !== undefined) {
				if (Array.isArray(currentObj[key])) {
					// If array contains only strings, store the first value
					if (currentObj[key].every((item) => typeof item === 'string')) {
						result[fullPath] = currentObj[key][0];
					} else {
						result[fullPath] = currentObj[key].map((item) =>
							typeof item === 'object'
								? extractConfigParametersFromParsedXml(
										item,
										currentConfig[key] as IXmlParametersExtractionConfig
								  )
								: item
						);
					}
				} else if (typeof currentObj[key] === 'object') {
					result[fullPath] = extractConfigParametersFromParsedXml(
						currentObj[key],
						currentConfig[key] as IXmlParametersExtractionConfig
					);
				} else {
					result[fullPath] = currentObj[key];
				}
			}
		}
	}

	recursiveExtract(xmlData, config);
	return result;
};
