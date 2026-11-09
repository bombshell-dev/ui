import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}
	const closestMarkup = `
  <div id="test8" class="div3" style="display:none">
    <div id="test7" class="div2">
      <div id="test6" class="div1">
        <form id="test10" class="form2"></form>
        <form id="test5" class="form1" name="form-a">
          <input id="test1" class="input1" required>
          <fieldset class="fieldset2" id="test2">
            <select id="test3" class="select1" required>
              <option default id="test4" value="">Test4</option>
              <option selected id="test11">Test11</option>
              <option id="test12">Test12</option>
              <option id="test13">Test13</option>
            </select>
            <input id="test9" type="text" required>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
  <div id="log"></div>`;
	const closestCases = [
		['select', 'test12', 'test3'],
		['fieldset', 'test13', 'test2'],
		['div', 'test13', 'test6'],
		['body', 'test3', 'body'],
		['[default]', 'test4', 'test4'],
		['[selected]', 'test4', ''],
		['[selected]', 'test11', 'test11'],
		['[name="form-a"]', 'test12', 'test5'],
		['form[name="form-a"]', 'test13', 'test5'],
		['input[required]', 'test9', 'test9'],
		['select[required]', 'test9', ''],
		['div:not(.div1)', 'test13', 'test7'],
		['div.div3', 'test6', 'test8'],
		['div#test7', 'test1', 'test7'],
		['.div3 > .div2', 'test12', 'test7'],
		['.div3 > .div1', 'test12', ''],
		['form > input[required]', 'test9', ''],
		['fieldset > select[required]', 'test12', 'test3'],
		['input + fieldset', 'test6', ''],
		['form + form', 'test3', 'test5'],
		['form + form', 'test5', 'test5'],
		[':empty', 'test10', 'test10'],
		[':last-child', 'test11', 'test2'],
		[':first-child', 'test12', 'test3'],
		[':invalid', 'test11', 'test2'],
		[':scope', 'test4', 'test4'],
		['select > :scope', 'test4', 'test4'],
		['div > :scope', 'test4', ''],
		[':has(> :scope)', 'test4', 'test3'],
	] as const;

	const { expect } = context.runner;

	for (const [selector, elementId, targetId] of closestCases) {
		context.test(
			`WPT Element-closest.html: Element.closest with context node '${elementId}' and selector '${selector}'`,
			(fixture) => {
				const document = html(fixture, closestMarkup);
				const oldId = document.body.getAttribute('id');
				document.body.id = 'body';
				fixture.cleanup(() => {
					if (oldId === null) document.body.removeAttribute('id');
					else document.body.id = oldId;
				});
				const result = document.getElementById(elementId)!.closest(selector);
				if (result === null) expect(targetId).toBe('');
				else expect(result.id).toBe(targetId);
			},
		);
	}
}
