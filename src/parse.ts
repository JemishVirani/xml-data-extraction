import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import xml2js from 'xml2js';
import fs from 'fs';

const parser = new XMLParser({
	ignoreAttributes: false,
	isArray: (
		tagName: string,
		jPath: string,
		isLeafNode: boolean,
		isAttribute: boolean
	) => {
		if (isAttribute) return false;
		return true;
	},
	alwaysCreateTextNode: true,
	attributesGroupName: '$',
	textNodeName: '_',
	attributeNamePrefix: '',
});

const parseXmlUsingFastXmlParser = () => {
	const filePath = 'files/bigger-D406.xml';
	const xmlBuffer = fs.readFileSync(filePath);
	const dummyXml = `
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="RON" Base="1">0.00</cbc:TaxAmount>
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="RON" Base="1">0.00</cbc:TaxableAmount>
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

	console.time('parseTime');
	const parsedData = parser.parse(xmlBuffer);
	console.timeEnd('parseTime');
	// console.dir(parsedData, { depth: null });
};

const parseXmlUsingXmlParser = async () => {
	const filePath = 'files/bigger-D406.xml';
	const xmlStr = fs.readFileSync(filePath, { encoding: 'utf-8' });
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

	console.time('parseTime');
	const parsedData = await xml2js.parseStringPromise(xmlStr, {
		explicitArray: true,
		explicitCharkey: true,
	});
	console.timeEnd('parseTime');
	// console.dir(parsedData, { depth: null });
};

parseXmlUsingFastXmlParser();
parseXmlUsingXmlParser();
