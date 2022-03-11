import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap, ClassInfo } from 'lit/directives/class-map.js';
import { styleMap, StyleInfo } from 'lit/directives/style-map.js';

import flatSliderStyles from './flat-slider.scss';

@customElement('flat-slider')
export class FlatSlider extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) inverted = false;
  @property({ type: Boolean }) vertical = false;
  @property({ type: Number }) thumbMargin = 0;
  @property({ type: Number }) high: number | null = null;
  @property({ type: Number }) low: number | null = null;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) step = 1;
  @property({ type: Number }) value = 0;
  @property() showLabel: 'active' | 'all' | 'always' | 'never' = 'never';
  @property() highAriaLabel = 'high';
  @property() lowAriaLabel = 'low';
  @property() valueAriaLabel = 'value';
  formatLabel!: (value: number) => string | number;

  @state() private labelShowing = false;
  private activeThumb: ActiveThumb | null = null;
  private labelTimeout: ReturnType<typeof setTimeout> | null = null;
  private stepDecimalPlaces: number | null = null;
  private trackDimensions: DOMRect | null = null;

  private activeThumbSet(
    id: ThumbId,
    max: number,
    min: number,
    movementType: Movement
  ): void {
    this.activeThumb = {
      id,
      max,
      min,
      movementType,
      startingValue: this[id]!,
    };
  }

  private activeThumbClear() {
    this.activeThumb = null;
  }

  private displayLabels() {
    if (['always', 'never'].includes(this.showLabel)) return;
    if (this.labelTimeout) clearTimeout(this.labelTimeout);
    this.labelShowing = true;
  }

  private hideLabels() {
    if (!this.labelShowing) return;
    this.labelTimeout = setTimeout(() => {
      this.labelShowing = false;
    }, 600);
  }

  private displayValue(thumbId: ThumbId): number | string {
    if (this[thumbId] === null) return '';
    if (this.formatLabel) {
      return this.formatLabel(this[thumbId]!);
    }

    return this[thumbId]!;
  }

  private bindEvents(triggerEvent: MouseEvent | TouchEvent) {
    const isTouch = isTouchEvent(triggerEvent);
    const options = isTouch ? { passive: true } : false;
    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    const endEvent = isTouch ? 'touchend' : 'mouseup';

    document.addEventListener(endEvent, this.pointerUp, options);
    document.addEventListener(moveEvent, this.pointerMove, options);

    if (isTouch) {
      document.addEventListener('touchcancel', this.pointerUp, {
        passive: true,
      });
    }
  }

  private unbindEvents() {
    document.removeEventListener('mouseup', this.pointerUp);
    document.removeEventListener('touchend', this.pointerUp);
    document.removeEventListener('mousemove', this.pointerMove);
    document.removeEventListener('touchmove', this.pointerMove);
  }

  private emitEvent(eventName: string) {
    if (!this.activeThumb) return;
    const event = new CustomEvent(eventName, {
      detail: {
        [this.activeThumb.id]: this[this.activeThumb.id],
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private calcPercentageAsDecimalFromValue(value: number | null): number {
    return ((value || 0) - this.min) / (this.max - this.min);
  }

  private calcPercentageFromPosition(pointerPosition: PointerPosition) {
    if (!this.trackDimensions) return null;
    const offset = this.vertical
      ? this.trackDimensions.top
      : this.trackDimensions.left;
    const size = this.vertical
      ? this.trackDimensions.height
      : this.trackDimensions.width;
    const posComponent = this.vertical ? pointerPosition.y : pointerPosition.x;

    let percent = clamp((posComponent - offset) / size);

    // Need to reverse coordinates based on inversion and orientation
    const shouldReverseCoordinates = this.vertical
      ? !this.inverted
      : this.inverted;
    if (shouldReverseCoordinates) percent = 1 - percent;

    return percent;
  }

  private calcValueFromPercentage(percentage: number) {
    return this.min + percentage * (this.max - this.min);
  }

  private constrainValueForThumb(thumbId: ThumbId) {
    let v = this[thumbId]!;
    const { max, min } = this.getMinMaxForThumb(thumbId);

    // between min and max
    if (v < min || v > max) {
      v = clamp(v, min, max);
    }

    // to number of decimal places of step
    if (
      this.stepDecimalPlaces &&
      this.getDecimalPlacesOfNumber(v) > this.stepDecimalPlaces
    ) {
      v = Number(v.toFixed(this.stepDecimalPlaces));
    }

    return v;
  }

  private generateContainerClasses(): ClassInfo {
    return {
      'flat-slider': true,
      'flat-slider-horizontal': !this.vertical,
      'flat-slider-vertical': this.vertical,
      'flat-slider-disabled': this.disabled,
      'flat-slider-axis-inverted': this.vertical
        ? !this.inverted
        : this.inverted,
      'flat-slider-thumb-label-show-all':
        (this.showLabel === 'all' && this.labelShowing) ||
        this.showLabel === 'always',
    };
  }

  private generateThumbClasses(thumbId: ThumbId): ClassInfo {
    return {
      'flat-slider-thumb': true,
      'flat-slider-thumb-active':
        this.showLabel === 'active' && this.activeThumb
          ? this.activeThumb.id === thumbId
          : false,
      [`flat-slider-thumb-${thumbId}`]: true,
    };
  }

  private generateThumbStyle(thumbId: ThumbId): StyleInfo {
    if (typeof this[thumbId] !== 'number') return {};
    const percentAsDecimal = clamp(
      this.calcPercentageAsDecimalFromValue(this[thumbId])
    );

    let side: string;
    if (this.vertical) {
      side = this.inverted ? 'top' : 'bottom';
    } else {
      side = this.inverted ? 'right' : 'left';
    }

    return {
      [side]: `calc(${percentAsDecimal * 100}% - (var(--private-thumb-${
        this.vertical ? 'height' : 'width'
      }-total) * ${percentAsDecimal}))`,
    };
  }

  private generateTrackFillStyle(thumbId: ThumbId): StyleInfo {
    const invert = thumbId === 'high';

    if (typeof this[thumbId] !== 'number') return {};
    const percentAsDecimal = clamp(
      this.calcPercentageAsDecimalFromValue(this[thumbId])
    );
    const actual = invert ? 1 - percentAsDecimal : percentAsDecimal;
    const scale = this.vertical ? `1, ${actual}, 1` : `${actual}, 1, 1`;

    return {
      transform: `scale3d(${scale})`,
    };
  }

  private getDecimalPlacesOfNumber(value: number): number {
    return value.toString().split('.').pop()!.length;
  }

  private getMinMaxForThumb(thumbId: ThumbId) {
    const max = thumbId === 'low' ? this.high! - this.thumbMargin : this.max;
    const min = thumbId === 'high' ? this.low! + this.thumbMargin : this.min;
    return { min, max };
  }

  private getTrackDimensions(): DOMRect | null {
    const track = this.shadowRoot?.querySelector(
      '.flat-slider-track-container'
    ) as HTMLDivElement;
    return track ? track.getBoundingClientRect() : null;
  }

  private keyDown(event: KeyboardEvent) {
    if (
      this.disabled ||
      !this.activeThumb ||
      this.activeThumb.movementType !== 'keyboard'
    )
      return;

    const old = this[this.activeThumb.id];

    // It appears that HTML input ranges adjust by 10% of the max using Page Up/Down
    const bigStep = this.max / 10;

    const valueIncrement = (increment: number) => {
      const value = clamp(
        Number(this[this.activeThumb!.id]),
        this.activeThumb!.min,
        this.activeThumb!.max
      );
      return clamp(
        value + increment,
        this.activeThumb!.min,
        this.activeThumb!.max
      );
    };

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowLeft':
        this[this.activeThumb.id] = valueIncrement(-this.step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this[this.activeThumb.id] = valueIncrement(this.step);
        break;
      case 'End':
        this[this.activeThumb.id] = this.activeThumb.max;
        break;
      case 'Home':
        this[this.activeThumb.id] = this.activeThumb.min;
        break;
      case 'PageDown':
        this[this.activeThumb.id] = valueIncrement(-bigStep);
        break;
      case 'PageUp':
        this[this.activeThumb.id] = valueIncrement(bigStep);
        break;
      default:
        return;
    }

    if (old !== this[this.activeThumb.id]) {
      this.emitEvent('change');
      this.emitEvent('input');
    }

    event.preventDefault();
  }

  private pointerDown(event: MouseEvent | TouchEvent) {
    if (
      this.disabled ||
      this.activeThumb ||
      (!isTouchEvent(event) && (event as MouseEvent).button !== 0)
    )
      return;
    this.bindEvents(event);
    const pointerPosition = getPointerPosition(event);

    if (pointerPosition) {
      this.trackDimensions = this.getTrackDimensions();
      const thumbId = this.findClosestThumb(pointerPosition);
      if (thumbId) {
        const { min, max } = this.getMinMaxForThumb(thumbId);
        this.activeThumbSet(thumbId, max, min, 'pointer');
        if (event.cancelable) event.preventDefault();
        this.displayLabels();
        this.updateActiveThumbFromPosition(pointerPosition);
      }
    }
  }

  private findClosestThumb(pointerPosition: PointerPosition): ThumbId | null {
    if (typeof this.low !== 'number' || typeof this.high !== 'number')
      return 'value';
    const percent = this.calcPercentageFromPosition(pointerPosition);
    if (!percent) return null;
    const positionValue = this.calcValueFromPercentage(percent);

    if (
      (this.low === this.high && positionValue < this.low) ||
      Math.abs(positionValue - this.low) < Math.abs(positionValue - this.high)
    ) {
      return 'low';
    } else {
      return 'high';
    }
  }

  private pointerMove(event: MouseEvent | TouchEvent) {
    if (this.activeThumb && this.activeThumb.movementType === 'pointer') {
      const pointerPosition = getPointerPosition(event);

      if (pointerPosition) {
        const oldValue = this[this.activeThumb.id];
        event.preventDefault();
        this.updateActiveThumbFromPosition(pointerPosition);

        if (oldValue !== this[this.activeThumb.id] && this.activeThumb.id) {
          this.emitEvent('input');
        }
      }
    }
  }

  private pointerUp(event: MouseEvent | TouchEvent) {
    if (this.activeThumb && this.activeThumb.movementType === 'pointer') {
      if (!isTouchEvent(event)) {
        event.preventDefault();
        this.unbindEvents();
      }
      if (this.activeThumb.startingValue !== this[this.activeThumb.id]) {
        this.emitEvent('change');
      }

      this.activeThumbClear();
      this.hideLabels();
    }
  }

  private renderThumb(thumbId: ThumbId): TemplateResult {
    const displayValue = this.displayValue(thumbId);

    return html` <div
      class=${classMap(this.generateThumbClasses(thumbId))}
      id="${thumbId}"
      style=${styleMap(this.generateThumbStyle(thumbId))}
      tabindex="0"
      aria-disabled=${this.disabled}
      aria-valuenow=${this[thumbId] || ''}
      aria-valuemax=${this.max}
      aria-valuemin=${this.min}
      aria-valuetext=${displayValue}
      aria-label=${this[`${thumbId}AriaLabel`]}
      role="slider"
      @blur=${this.thumbBlur}
      @focus=${this.thumbFocus}
    >
      ${['active', 'all', 'always'].includes(this.showLabel)
        ? html` <div class="flat-slider-thumb-label">
            <span class="flat-slider-thumb-label-text">${displayValue}</span>
          </div>`
        : html``}
    </div>`;
  }

  private renderTrackFill(thumbId: ThumbId): TemplateResult {
    return html` <div
      class="flat-slider-track-fill flat-slider-track-fill-${thumbId}"
      style=${styleMap(this.generateTrackFillStyle(thumbId))}
    ></div>`;
  }

  private thumbBlur() {
    this.activeThumbClear();
    this.hideLabels();
  }

  private thumbFocus(event: FocusEvent) {
    const element = event.target as HTMLElement;
    const thumbId = element.id as ThumbId;
    const { max, min } = this.getMinMaxForThumb(thumbId);
    this.activeThumbSet(thumbId, max, min, 'keyboard');
    this.displayLabels();
  }

  private updateActiveThumbFromPosition(pointerPosition: PointerPosition) {
    if (!this.trackDimensions || !this.activeThumb) return;
    const percent = this.calcPercentageFromPosition(pointerPosition);
    if (typeof percent !== 'number') return;

    if (percent === 0) {
      this[this.activeThumb.id] = this.activeThumb.min;
    } else if (percent === 1) {
      this[this.activeThumb.id] = this.activeThumb.max;
    } else {
      const exact = this.calcValueFromPercentage(percent);
      const closest =
        Math.round((exact - this.min) / this.step) * this.step + this.min;

      this[this.activeThumb.id] = clamp(
        closest,
        this.activeThumb.min,
        this.activeThumb.max
      );
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('mousedown', this.pointerDown);
    this.addEventListener('touchstart', this.pointerDown, { passive: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.keyDown);
    this.removeEventListener('mousedown', this.pointerDown);
    this.removeEventListener('touchstart', this.pointerDown);
    this.unbindEvents();
  }

  protected override willUpdate(
    changedProps: Map<string | number | symbol, unknown>
  ): void {
    if (changedProps.has('step')) {
      if (this.step % 1 !== 0) {
        this.stepDecimalPlaces = this.getDecimalPlacesOfNumber(this.step);
      }
    }
    (<ThumbId[]>['value', 'low', 'high']).forEach(thumb => {
      if (changedProps.has(thumb) && changedProps.get(thumb)) {
        this[thumb] = this.constrainValueForThumb(thumb);
      }
    });
  }

  constructor() {
    super();
    this.pointerUp = this.pointerUp.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
  }

  render(): TemplateResult {
    return html`
      <div class="${classMap(this.generateContainerClasses())}">
        <div class="flat-slider-track-container">
          <div class="flat-slider-track-background"></div>
          ${this.low !== null
            ? html`${this.renderTrackFill('low')}
              ${this.renderTrackFill('high')}`
            : html`${this.renderTrackFill('value')}`}
        </div>
        <div class="flat-slider-thumb-container">
          ${this.low !== null
            ? html`${this.renderThumb('low')} ${this.renderThumb('high')}`
            : html`${this.renderThumb('value')}`}
        </div>
      </div>
    `;
  }

  static styles = flatSliderStyles;
}

// limit the size of a number
function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(value, max));
}

function getPointerPosition(
  event: MouseEvent | TouchEvent
): PointerPosition | undefined {
  let point: { clientX: number; clientY: number } | undefined;
  if (isTouchEvent(event)) {
    point =
      (event as TouchEvent).touches[0] ||
      (event as TouchEvent).changedTouches[0];
  } else {
    point = event as MouseEvent;
  }

  return point ? { x: point.clientX, y: point.clientY } : undefined;
}

function isTouchEvent(event: MouseEvent | TouchEvent): boolean {
  return event.type[0] === 't';
}

interface ActiveThumb {
  id: ThumbId;
  max: number;
  min: number;
  movementType: Movement;
  startingValue: number;
}

type Movement = 'pointer' | 'keyboard';

type PointerPosition = {
  x: number;
  y: number;
};

type ThumbId = 'value' | 'low' | 'high';
