/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule StyleSheet
 * @flow
 * @format
 */
'use strict';

const PixelRatio = require('../Utilities/PixelRatio');
const ReactNativePropRegistry = require('../Renderer/shims/ReactNativePropRegistry');
const ReactNativeStyleAttributes = require('../Components/View/ReactNativeStyleAttributes');
const StyleSheetValidation = require('./StyleSheetValidation');

const flatten = require('./flattenStyle');

import type {
  ____StyleSheetInternalStyleIdentifier_Internal as StyleSheetInternalStyleIdentifier,
  ____Styles_Internal,
  ____DangerouslyImpreciseStyleProp_Internal,
  ____ViewStyleProp_Internal,
  ____TextStyleProp_Internal,
  ____ImageStyleProp_Internal,
  LayoutStyle,
} from './StyleSheetTypes';

export type DangerouslyImpreciseStyleProp = ____DangerouslyImpreciseStyleProp_Internal;
export type ViewStyleProp = ____ViewStyleProp_Internal;
export type TextStyleProp = ____TextStyleProp_Internal;
export type ImageStyleProp = ____ImageStyleProp_Internal;

let hairlineWidth = PixelRatio.roundToNearestPixel(0.4);
if (hairlineWidth === 0) {
  hairlineWidth = 1 / PixelRatio.get();
}

const absoluteFillObject: LayoutStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
const absoluteFill: StyleSheetInternalStyleIdentifier = ReactNativePropRegistry.register(
  absoluteFillObject,
); // This also freezes it

/**
 * A StyleSheet is an abstraction similar to CSS StyleSheets
 *
 * Create a new StyleSheet:
 *
 * ```
 * const styles = StyleSheet.create({
 *   container: {
 *     borderRadius: 4,
 *     borderWidth: 0.5,
 *     borderColor: '#d6d7da',
 *   },
 *   title: {
 *     fontSize: 19,
 *     fontWeight: 'bold',
 *   },
 *   activeTitle: {
 *     color: 'red',
 *   },
 * });
 * ```
 *
 * Use a StyleSheet:
 *
 * ```
 * <View style={styles.container}>
 *   <Text style={[styles.title, this.props.isActive && styles.activeTitle]} />
 * </View>
 * ```
 *
 * Code quality:
 *
 *  - By moving styles away from the render function, you're making the code
 *  easier to understand.
 *  - Naming the styles is a good way to add meaning to the low level components
 *  in the render function.
 *
 * Performance:
 *
 *  - Making a stylesheet from a style object makes it possible to refer to it
 * by ID instead of creating a new style object every time.
 *  - It also allows to send the style only once through the bridge. All
 * subsequent uses are going to refer an id (not implemented yet).
 */
module.exports = {
  /**
   * This is defined as the width of a thin line on the platform. It can be
   * used as the thickness of a border or division between two elements.
   * Example:
   * ```
   *   {
   *     borderBottomColor: '#bbb',
   *     borderBottomWidth: StyleSheet.hairlineWidth
   *   }
   * ```
   *
   * This constant will always be a round number of pixels (so a line defined
   * by it look crisp) and will try to match the standard width of a thin line
   * on the underlying platform. However, you should not rely on it being a
   * constant size, because on different platforms and screen densities its
   * value may be calculated differently.
   *
   * A line with hairline width may not be visible if your simulator is downscaled.
   */
  hairlineWidth,

  /**
   * A very common pattern is to create overlays with position absolute and zero positioning,
   * so `absoluteFill` can be used for convenience and to reduce duplication of these repeated
   * styles.
   */
  absoluteFill,

  /**
   * Sometimes you may want `absoluteFill` but with a couple tweaks - `absoluteFillObject` can be
   * used to create a customized entry in a `StyleSheet`, e.g.:
   *
   *   const styles = StyleSheet.create({
   *     wrapper: {
   *       ...StyleSheet.absoluteFillObject,
   *       top: 10,
   *       backgroundColor: 'transparent',
   *     },
   *   });
   */
  absoluteFillObject,

  /**
   * Combines two styles such that `style2` will override any styles in `style1`.
   * If either style is falsy, the other one is returned without allocating an
   * array, saving allocations and maintaining reference equality for
   * PureComponent checks.
   */
  compose(
    style1: ?DangerouslyImpreciseStyleProp,
    style2: ?DangerouslyImpreciseStyleProp,
  ): ?DangerouslyImpreciseStyleProp {
    if (style1 != null && style2 != null) {
      return [style1, style2];
    } else {
      return style1 != null ? style1 : style2;
    }
  },

  /**
   * Flattens an array of style objects, into one aggregated style object.
   * Alternatively, this method can be used to lookup IDs, returned by
   * StyleSheet.register.
   *
   * > **NOTE**: Exercise caution as abusing this can tax you in terms of
   * > optimizations.
   * >
   * > IDs enable optimizations through the bridge and memory in general. Refering
   * > to style objects directly will deprive you of these optimizations.
   *
   * Example:
   * ```
   * const styles = StyleSheet.create({
   *   listItem: {
   *     flex: 1,
   *     fontSize: 16,
   *     color: 'white'
   *   },
   *   selectedListItem: {
   *     color: 'green'
   *   }
   * });
   *
   * StyleSheet.flatten([styles.listItem, styles.selectedListItem])
   * // returns { flex: 1, fontSize: 16, color: 'green' }
   * ```
   * Alternative use:
   * ```
   * StyleSheet.flatten(styles.listItem);
   * // return { flex: 1, fontSize: 16, color: 'white' }
   * // Simply styles.listItem would return its ID (number)
   * ```
   * This method internally uses `StyleSheetRegistry.getStyleByID(style)`
   * to resolve style objects represented by IDs. Thus, an array of style
   * objects (instances of StyleSheet.create), are individually resolved to,
   * their respective objects, merged as one and then returned. This also explains
   * the alternative use.
   */
  flatten,

  /**
   * WARNING: EXPERIMENTAL. Breaking changes will probably happen a lot and will
   * not be reliably announced. The whole thing might be deleted, who knows? Use
   * at your own risk.
   *
   * Sets a function to use to pre-process a style property value. This is used
   * internally to process color and transform values. You should not use this
   * unless you really know what you are doing and have exhausted other options.
   */
  setStyleAttributePreprocessor(
    property: string,
    process: (nextProp: mixed) => mixed,
  ) {
    let value;

    if (typeof ReactNativeStyleAttributes[property] === 'string') {
      value = {};
    } else if (typeof ReactNativeStyleAttributes[property] === 'object') {
      value = ReactNativeStyleAttributes[property];
    } else {
      console.error(`${property} is not a valid style attribute`);
      return;
    }

    if (__DEV__ && typeof value.process === 'function') {
      console.warn(`Overwriting ${property} style attribute preprocessor`);
    }

    ReactNativeStyleAttributes[property] = {...value, process};
  },

  /**
   * Creates a StyleSheet style reference from the given object.
   */
  create<+S: ____Styles_Internal>(
    obj: S,
  ): $ObjMap<S, (Object) => StyleSheetInternalStyleIdentifier> {
    const result = {};
    for (const key in obj) {
      StyleSheetValidation.validateStyle(key, obj);
      result[key] = obj[key] && ReactNativePropRegistry.register(obj[key]);
    }
    return result;
  },
};
