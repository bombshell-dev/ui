import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function xml(
		{ DOMParser }: DOMFixture,
		options: { markup: string; type?: DOMParserSupportedType },
	): Document {
		return new DOMParser().parseFromString(options.markup, options.type ?? 'application/xml');
	}
	const soapMarkup = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Header>
          <ns2:ResponseHeader xmlns:ns2="https://adwords.google.com/api/adwords/mcm/v201509" xmlns="https://adwords.google.com/api/adwords/cm/v201509">
              <requestId>1234554321</requestId>
              <serviceName>ManagedCustomerService</serviceName>
              <methodName>get</methodName>
              <operations>1</operations>
              <responseTime>115</responseTime>
          </ns2:ResponseHeader>
      </soap:Header>
      <soap:Body>
          <ns2:getResponse xmlns="https://adwords.google.com/api/adwords/cm/v201509" xmlns:ns2="https://adwords.google.com/api/adwords/mcm/v201509">
              <ns2:rval>
                  <totalNumEntries>2</totalNumEntries>
                  <Page.Type>ManagedCustomerPage</Page.Type>
                  <ns2:entries>
                      <ns2:name>Test1</ns2:name>
                      <ns2:customerId>1234566789</ns2:customerId>
                  </ns2:entries>
                  <ns2:entries>
                      <ns2:name>Test2</ns2:name>
                      <ns2:customerId>987654321</ns2:customerId>
                  </ns2:entries>
              </ns2:rval>
          </ns2:getResponse>
      </soap:Body>
  </soap:Envelope>`;

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelectorAll-namespace.html: querySelectorAll with namespaced XML elements',
		(fixture) => {
			const document = xml(fixture, { markup: soapMarkup, type: 'text/xml' });
			expect(document.querySelectorAll('rval > entries').length).toBe(2);
		},
	);
}
