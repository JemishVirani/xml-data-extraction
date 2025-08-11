export type IParsedXmlData = {
	$?: { [key: string]: string };
	[key: string]:
		| string
		| string[]
		| IParsedXmlData
		| IParsedXmlData[]
		| undefined;
};

export type IXmlTextWithAttributes = {
	_: string;
	$?: Record<string, string>;
};

export type IXmlParameterValue = (string | IXmlTextWithAttributes)[];

export type ITransformedParseXmlData = {
	tagName: string;
	[key: string]: any;
	childNodes?: ITransformedParseXmlData[];
};

export type ISingleKeyParametersData = {
	[key: string]: string[] | null;
};
export type IParentChildParametersData = {
	[key: string]: Record<string, string | null>[] | null;
};

export type IPredefinedParametersData = {
	single_parameters: ISingleKeyParametersData | null;
	parent_child_parameters: IParentChildParametersData | null;
};

export type IXmlParametersExtractionConfig = {
	[key: string]: boolean | IXmlParametersExtractionConfig;
};

export type IXmlConfigParametersData = {
	[key: string]:
		| string
		| IXmlConfigParametersData
		| Array<IXmlConfigParametersData>;
};
