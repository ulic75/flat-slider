import { html, fixture, expect } from '@open-wc/testing';
import { sendMouse } from '@web/test-runner-commands';
import { spy } from 'sinon';
// import { visualDiff } from '@web/test-runner-visual-regression';

import { FlatSlider } from './flat-slider.js';

describe('FlatSlider', () => {
  it('is defined', () => {
    const element = document.createElement('flat-slider');
    expect(element).to.be.instanceof(FlatSlider);
  });
});

describe('default slider', () => {
  let sliderElement: FlatSlider;
  let trackFillElement: HTMLElement;
  let thumbElement: HTMLElement;

  beforeEach(async () => {
    sliderElement = await fixture(html`<flat-slider></flat-slider>`);
    trackFillElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-track-fill'
    ) as HTMLElement;
    thumbElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-thumb'
    ) as HTMLElement;
  });

  it('should set the default values', () => {
    expect(sliderElement.value).to.equal(0);
    expect(sliderElement.high).to.be.null;
    expect(sliderElement.low).to.be.null;
    expect(sliderElement.min).to.equal(0);
    expect(sliderElement.max).to.equal(100);
  });

  it('should update the value on click', async () => {
    const position = mousePositionForPercentage(sliderElement, 0.13);

    expect(sliderElement.value).to.equal(0);

    await sendMouse({ type: 'click', position });

    expect(sliderElement.value).to.equal(13);
  });

  it('should update the value on move', async () => {
    expect(sliderElement.value).to.equal(0);

    await move(sliderElement, 0, 0.13);

    expect(sliderElement.value).to.equal(13);
  });

  it('should be to set to min when moved to bottom', async () => {
    await move(sliderElement, 0.13, 0);
    expect(sliderElement.value).to.equal(0);
  });

  it('should set the value to min when value is less than min', async () => {
    expect(sliderElement.value).to.equal(0);

    await move(sliderElement, 0.5, -0.13);

    expect(sliderElement.value).to.equal(0);
  });

  it('should set the value to max when value is more than max', async () => {
    expect(sliderElement.value).to.equal(0);

    await move(sliderElement, 0.5, 1.13);

    expect(sliderElement.value).to.equal(100);
  });

  it('should update the track fill on value change', async () => {
    expect(trackFillElement.style.transform).to.contain('scale3d(0, 1, 1)');

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(trackFillElement.style.transform).to.contain('scale3d(0.13, 1, 1)');
  });

  it('should update the thumb position on value change', async () => {
    expect(thumbElement.style.left).to.contain('0%').and.contain('* 0');

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(thumbElement.style.left).to.contain('13%').and.contain('* 0.13');
  });
});

describe('slider with custom label formatting', () => {
  let sliderElement: FlatSlider;
  let thumbLabelTextElement: HTMLElement;

  const formatter = (value: number) => `$${value}`;

  beforeEach(async () => {
    sliderElement = await fixture(
      html`<flat-slider
        .formatLabel=${formatter}
        showLabel="always"
      ></flat-slider>`
    );
    thumbLabelTextElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-thumb-label-text'
    ) as HTMLElement;
  });

  it('should call the formatLabel fuction with value', async () => {
    const formatLabelSpy = spy(sliderElement, 'formatLabel');

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(formatLabelSpy.callCount).to.equal(1);
    expect(formatLabelSpy).to.have.been.calledWith(13);
  });

  it('should format the thumb label based on the formatLabel function', async () => {
    const position = mousePositionForPercentage(sliderElement, 0.1);
    await sendMouse({ type: 'click', position });

    expect(thumbLabelTextElement.textContent).to.equal('$10');
  });
});

describe('slider with showLabel', () => {
  let sliderElement: FlatSlider;
  let thumbLabelTextElement: HTMLElement;

  beforeEach(async () => {
    sliderElement = await fixture(
      html`<flat-slider showLabel="always"></flat-slider>`
    );
    thumbLabelTextElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-thumb-label-text'
    ) as HTMLElement;
  });

  it('should add class "flat-slider-thumb-label-show-all" momentarily when set to "all"', async () => {
    const showAllClass = 'flat-slider-thumb-label-show-all';
    sliderElement = await fixture(
      html`<flat-slider showLabel="all"></flat-slider>`
    );
    const wrapperElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider'
    ) as HTMLElement;

    expect(wrapperElement.classList.contains(showAllClass)).to.be.false;

    const position = mousePositionForPercentage(sliderElement, 0.2);
    await sendMouse({ type: 'click', position });

    expect(wrapperElement.classList.contains(showAllClass)).to.be.true;

    // wait the length of the fade out
    await delay(600);
    expect(wrapperElement.classList.contains(showAllClass)).to.be.false;
  });

  it('should always show the label when set to "always"', async () => {
    const showAllClass = 'flat-slider-thumb-label-show-all';
    const wrapperElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider'
    ) as HTMLElement;

    expect(wrapperElement.classList.contains(showAllClass)).to.be.true;
    expect(thumbLabelTextElement).to.exist;
    expect(thumbLabelTextElement.textContent).to.equal('0');
  });

  it('should not include the thumb label if showLabel is set incorrectly', async () => {
    sliderElement = await fixture(
      html`<!-- @ts-ignore --><flat-slider showLabel="badoption"></flat-slider>`
    );
    thumbLabelTextElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-thumb-label-text'
    ) as HTMLElement;

    expect(thumbLabelTextElement).to.not.exist;
  });
});

describe('vertical slider', () => {
  let sliderElement: FlatSlider;
  let trackFillElement: HTMLElement;

  beforeEach(async () => {
    sliderElement = await fixture(
      html`<flat-slider
        vertical
        style="--flat-slider-height: 210px; --flat-slider-width: 42px;"
      ></flat-slider>`
    );
    trackFillElement = sliderElement.shadowRoot!.querySelector(
      '.flat-slider-track-fill'
    ) as HTMLElement;
  });

  it('should update the value on click', async () => {
    expect(sliderElement.value).to.equal(0);

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.value).to.equal(13);
  });

  //! Refactor into a dedicated component
  it('should update value on click in inverted mode', async () => {
    sliderElement.inverted = true;
    await sliderElement.updateComplete;

    const position = mousePositionForPercentage(sliderElement, 0.3);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.value).to.equal(30);
  });

  it('should update the track fill on value change', async () => {
    expect(trackFillElement.style.transform).to.contain('scale3d(1, 0, 1)');

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(trackFillElement.style.transform).to.contain('scale3d(1, 0.13, 1)');
  });

  //! Refactor into a dedicated component
  it('should update the track fill on value change', async () => {
    sliderElement.inverted = true;
    await sliderElement.updateComplete;
    expect(trackFillElement.style.transform).to.contain('scale3d(1, 0, 1)');

    const position = mousePositionForPercentage(sliderElement, 0.13);
    await sendMouse({ type: 'click', position });

    expect(trackFillElement.style.transform).to.contain('scale3d(1, 0.13, 1)');
  });
});

describe('slider with custom min/max', () => {
  let sliderElement: FlatSlider;

  beforeEach(async () => {
    sliderElement = await fixture(
      html`<flat-slider min="45" max="95"></flat-slider>`
    );
  });

  it('should set the default values', () => {
    expect(sliderElement.value).to.equal(0);
    expect(sliderElement.low).to.be.null;
    expect(sliderElement.high).to.be.null;
    expect(sliderElement.min).to.equal(45);
    expect(sliderElement.max).to.equal(95);
  });

  it('should update the value on click', async () => {
    expect(sliderElement.value).to.equal(0);

    const position = mousePositionForPercentage(sliderElement, 0.5);
    await sendMouse({ type: 'click', position });

    const value = Math.round(45 + 0.5 * (95 - 45));
    expect(sliderElement.value).to.equal(value);
  });
});

describe('slider with two thumbs and custom min/max', () => {
  let sliderElement: FlatSlider;

  beforeEach(async () => {
    sliderElement = await fixture(
      html`<flat-slider min="45" max="95" low="66" high="73"></flat-slider>`
    );
  });

  it('should change the low thumb value when click is below and low/high are equal', async () => {
    sliderElement.low = 70;
    sliderElement.high = 70;
    await sliderElement.updateComplete;

    let position = mousePositionForValue(sliderElement, 69);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.low).to.equal(69);
    expect(sliderElement.high).to.equal(70);
  });

  it('should change the high thumb value when click is above and low/high are equal', async () => {
    sliderElement.low = 70;
    sliderElement.high = 70;
    await sliderElement.updateComplete;

    let position = mousePositionForValue(sliderElement, 71);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.low).to.equal(70);
    expect(sliderElement.high).to.equal(71);
  });

  it('should change the correct thumb value based on click position', async () => {
    expect(sliderElement.low).to.equal(66);
    expect(sliderElement.high).to.equal(73);

    let position = mousePositionForValue(sliderElement, 74);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.low).to.equal(66);
    expect(sliderElement.high).to.equal(74);

    position = mousePositionForValue(sliderElement, 65);
    await sendMouse({ type: 'click', position });

    expect(sliderElement.low).to.equal(65);
    expect(sliderElement.high).to.equal(74);
  });
});

// describe('visual test example', () => {
//   it('should be in a default state', async () => {
//     const el: FlatSlider = await fixture(html`<flat-slider></flat-slider>`);

//     expect(el.value).to.equal(0);
//     await visualDiff(el, 'default');
//   });
// });

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function move(sliderElement: FlatSlider, start: number, end: number) {
  const startPosition = mousePositionForPercentage(sliderElement, start);
  const endPosition = mousePositionForPercentage(sliderElement, end);

  await sendMouse({ type: 'move', position: startPosition });
  await sendMouse({ type: 'down' });
  await sendMouse({ type: 'move', position: endPosition });
}

function mousePositionForValue(
  sliderElement: FlatSlider,
  value: number
): [number, number] {
  const track = sliderElement.shadowRoot!.querySelector(
    '.flat-slider-track-container'
  );
  const invertAxis = sliderElement.shadowRoot!.querySelector(
    '.flat-slider-axis-inverted'
  );
  const dimensions = track?.getBoundingClientRect() || ({} as DOMRect);
  const min = sliderElement.min;
  const max = sliderElement.max;
  const percentage = (value - min) / (max - min);
  const pct = invertAxis ? 1 - percentage : percentage;
  const x = Math.round(dimensions.left + dimensions.width * pct);
  const y = Math.round(dimensions.top + dimensions.height * pct);

  return [x, y];
}

function mousePositionForPercentage(
  sliderElement: FlatSlider,
  percentage: number
): [number, number] {
  const track = sliderElement.shadowRoot!.querySelector(
    '.flat-slider-track-container'
  );
  const invertAxis = sliderElement.shadowRoot!.querySelector(
    '.flat-slider-axis-inverted'
  );
  const dimensions = track?.getBoundingClientRect() || ({} as DOMRect);
  const pct = invertAxis ? 1 - percentage : percentage;
  const x = Math.round(dimensions.left + dimensions.width * pct);
  const y = Math.round(dimensions.top + dimensions.height * pct);

  return [x, y];
}
