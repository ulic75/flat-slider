---
layout: splash
title: Styling
---

# &nbsp;

# Styling

Styling the FlatSlider component can be accomplished through the setting of CSS Variables. Below is a list of the available variables and what parts of the slider they set.

| CSS Variable                                           | Default                                        | Use                                                                                                               |
| ------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| <span>Slider</span>{:style="font-size: 1.25em;"}       |
| `--flat-slider-height`                                 | 42px                                           | The height of the whole slider container. _Note_: This should be swapped with width when making a vertical slider |
| `--flat-slider-width`                                  | 100%                                           | The width of the whole slider container. _Note_: This should be swapped with height when making a vertical slider |
| `--flat-slider-disabled-color`                         | <span>rgb(189, 189, 189)</span>{:.text-nowrap} | Used for all elements of the slider when it's disabled                                                            |
|                                                        |
| <span>Track</span>{:style="font-size: 1.25em;"}        |
| `--flat-slider-track-radius`                           | 14px                                           | Corner rounding on the slider track                                                                               |
| `--flat-slider-track-background`                       | rgba(51, 51, 51, 0.05)                         | Background color of the slider track                                                                              |
| `--flat-slider-track-fill-color`                       | rgb(255, 145, 1)                               | Color of the track fill when using a single thumb value slider                                                    |
| `--flat-slider-track-fill-color-low`                   | #f58d42                                        | Color of the track fill for the low thumb when using a dual thumb slider                                          |
| `--flat-slider-track-fill-color-high`                  | #3381ff                                        | Color of the track fill for the high thumb when using a dual thumb slider                                         |
| `--flat-slider-track-thickness`                        | 42px                                           | The thickness of the actual track, height for horizontal sliders and width for vertical sliders                   |
|                                                        |
| <span>Thumb</span>{:style="font-size: 1.25em;"}        |
| `--flat-slider-thumb-height`                           | 42px                                           | The height of the thumb (before borders)                                                                          |
| `--flat-slider-thumb-width`                            | 0px                                            | The width of the thumb (before borders)                                                                           |
| `--flat-slider-thumb-color`                            | white                                          | Color of the thumb when using a single thumb slider                                                               |
| `--flat-slider-thumb-color-low`                        | white                                          | Color of the low thumb when using a dual thumb slider                                                             |
| `--flat-slider-thumb-color-high`                       | white                                          | Color of the high thumb when using a dual thumb slider                                                            |
| `--flat-slider-thumb-border-color`                     | rgb(255, 145, 1)                               | Color of the border around the thumb using a single thumb slider                                                  |
| `--flat-slider-thumb-border-color-low`                 | #f58d42                                        | Color of the border around the low thumb using a dual thumb slider                                                |
| `--flat-slider-thumb-border-color-high`{:.text-nowrap} | #3381ff                                        | Color of the border around the high thumb using a dual thumb slider                                               |
| `--flat-slider-thumb-border-height`                    | 0px                                            | The top and bottom border size of the thumb                                                                       |
| `--flat-slider-thumb-border-width`                     | 0px                                            | The right and left border size of the thumb                                                                       |
| `--flat-slider-thumb-radius`                           | 0px                                            | Corner rounding on the thumb                                                                                      |
|                                                        |
| <span>Thumb Label</span>{:style="font-size: 1.25em;"}  |
| `--flat-slider-thumb-label-height`                     | 20px                                           |                                                                                                                   |
| `--flat-slider-thumb-label-width`                      | 25px                                           |                                                                                                                   |
| `--flat-slider-thumb-label-color`                      | rgb(255, 145, 1)                               | Color behind the thumb label text when using a single thumb slider                                                |
| `--flat-slider-thumb-label-color-low`                  | #f58d42                                        | Color behind the low thumb label text when using a dual thumb slider                                              |
| `--flat-slider-thumb-label-color-high`                 | #3381ff                                        | Color behind the high thumb label text when using a dual thumb slider                                             |
| `--flat-slider-thumb-label-font-color`                 | white                                          |                                                                                                                   |
| `--flat-slider-thumb-label-font-size`                  | 12px                                           |                                                                                                                   |
| `--flat-slider-thumb-label-gap`                        | 2px                                            | Distance between the thumb and the label                                                                          |
| `--flat-slider-thumb-label-radius`                     | 4px                                            | Corner radius on the labels                                                                                       |
| ===                                                    | ===                                            | ===                                                                                                               |
| footer                                                 |
