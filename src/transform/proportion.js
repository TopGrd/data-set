const assign = require('lodash/assign');
const forIn = require('lodash/forIn');
const isString = require('lodash/isString');
const {
  registerTransform
} = require('../data-set');
const partition = require('../util/partition');

const DEFAULT_OPTIONS = {
  // field: 'y', // required
  // dimension: 'x', // required
  groupBy: [], // optional
  as: '_proportion'
};

function transform(dataView, options = {}) {
  options = assign({}, DEFAULT_OPTIONS, options);
  const field = options.field;
  const dimension = options.dimension;
  const groupBy = options.groupBy;
  let as = options.as;
  if (!isString(field)) {
    throw new TypeError('Invalid field: must be a string!');
  }
  if (!isString(dimension)) {
    throw new TypeError('Invalid dimension: must be a string!');
  }
  if (Array.isArray(as)) {
    console.warn('Invalid as: must be a string, will use the first element of the array specified.');
    as = as[0];
  }
  if (!isString(as)) {
    throw new TypeError('Invalid as: must be a string!');
  }
  const rows = dataView.rows;
  const result = [];
  const groups = partition(rows, groupBy);
  forIn(groups, group => {
    const totalCount = group.length;
    const innerGroups = partition(group, [ dimension ]);
    forIn(innerGroups, innerGroup => {
      const innerCount = innerGroup.length;
      // const resultRow = pick(innerGroup[0], union(groupBy, [ dimension ]));
      const resultRow = innerGroup[0];
      // FIXME in case dimension and field is the same
      const dimensionValue = resultRow[dimension];
      resultRow[field] = innerCount;
      resultRow[dimension] = dimensionValue;
      resultRow[as] = innerCount / totalCount;
      result.push(resultRow);
    });
  });
  dataView.rows = result;
}

registerTransform('proportion', transform);
