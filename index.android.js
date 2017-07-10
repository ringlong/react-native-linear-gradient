// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { processColor, requireNativeComponent, PointPropType, StyleSheet, View, ViewPropTypes } from 'react-native';
const deprecatedPropType = require('react-native/Libraries/Utilities/deprecatedPropType.js');

const convertPoint = (name, point) => {
  if (Array.isArray(point)) {
    console.warn(
      `LinearGradient '${name}' property shoule be an object with fields 'x' and 'y', ` +
      'Array type is deprecated.'
    );
  }
  if (point !== null && typeof point === 'object') {
    return [point.x, point.y];
  }
  return point;
};

type PropsType = {
  start?: Array<number> | {x: number, y: number};
  end?: Array<number> | {x: number, y: number};
  colors: Array<string>;
  locations?: Array<number>;
} & typeof(View);

/**
 * Checks if value is a valid number. Otherwise, defaults to defaultValue.
 * 
 * @param {number} defaultValue 
 */
const validNumber = (defaultValue) => (value) => {
  return typeof value === 'number' ? value : defaultValue;
};

export default class LinearGradient extends Component {
  static propTypes = {
    start: PropTypes.oneOfType([
      PointPropType,
      deprecatedPropType(
        PropTypes.arrayOf(PropTypes.number),
        'Use point object with {x, y} instead.'
      )
    ]),
    end: PropTypes.oneOfType([
      PointPropType,
      deprecatedPropType(
        PropTypes.arrayOf(PropTypes.number),
        'Use point object with {x, y} instead.'
      )
    ]),
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    locations: PropTypes.arrayOf(PropTypes.number),
    ...ViewPropTypes,
  };
  props: PropsType;
  gradientRef: any;

  setNativeProps(props: PropsType) {
    this.gradientRef.setNativeProps(props);
  }

  render() {
    const {
      children,
      colors,
      end,
      locations,
      start,
      style,
      ...otherProps
    } = this.props;

    if ((colors && locations) && (colors.length !== locations.length)) {
      console.warn('LinearGradient colors and locations props should be arrays of the same length');
    }

    // inherit container borderRadius until this issue is resolved:
    // https://github.com/facebook/react-native/issues/3198
    const flatStyle = StyleSheet.flatten(style) || {};
    const borderRadius = flatStyle.borderRadius || 0;
    const validRadius = validNumber(borderRadius);

    // this is the format taken by:
    // http://developer.android.com/reference/android/graphics/Path.html#addRoundRect(android.graphics.RectF, float[], android.graphics.Path.Direction)
    const borderRadiiPerCorner = [
      validRadius(flatStyle.borderTopLeftRadius),
      validRadius(flatStyle.borderTopLeftRadius),
      validRadius(flatStyle.borderTopRightRadius),
      validRadius(flatStyle.borderTopRightRadius),
      validRadius(flatStyle.borderBottomRightRadius),
      validRadius(flatStyle.borderBottomRightRadius),
      validRadius(flatStyle.borderBottomLeftRadius),
      validRadius(flatStyle.borderBottomLeftRadius)
    ];

    return (
      <View ref={(component) => { this.gradientRef = component; }} {...otherProps} style={style}>
        <NativeLinearGradient
          style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
          colors={colors.map(processColor)}
          start={convertPoint('start', start)}
          end={convertPoint('end', end)}
          locations={locations ? locations.slice(0, colors.length) : null}
          borderRadii={borderRadiiPerCorner}
        />
        { children }
      </View>
    );
  }
}

const NativeLinearGradient = requireNativeComponent('BVLinearGradient', null);
