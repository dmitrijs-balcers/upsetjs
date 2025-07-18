/**
 * @upsetjs/model
 * https://github.com/upsetjs/upsetjs
 *
 * Copyright (c) 2021 Samuel Gratzl <sam@sgratzl.com>
 */

import type { ISets, ISet } from '../model';
import { PostprocessSetOptions, postprocessSets } from './asSets';
import { cardinality } from './utils';

/**
 * extract sets out of a given element array, where an accessor is used to specify the set names
 * @param elements list of elements
 * @param acc accessor to get the list of sets the element belong to
 * @param options postprocess options
 */
export default function extractSets<T>(
  elements: readonly T[],
  acc: (elem: T) => string[],
  options?: PostprocessSetOptions<T>
): ISets<T>;
/**
 * extract sets out of a given element array which have a `.sets` property
 * @param elements
 * @param options postprocess options
 */
// eslint-disable-next-line no-redeclare
export default function extractSets<T extends { sets: string[] }>(
  elements: readonly T[],
  options?: PostprocessSetOptions<T>
): ISets<T>;

// eslint-disable-next-line no-redeclare
export default function extractSets<T>(
  elements: readonly T[],
  accOrOptions?: PostprocessSetOptions<T> | ((elem: T) => string[]),
  o: PostprocessSetOptions<T> = {}
): ISets<T> {
  const acc = typeof accOrOptions === 'function' ? accOrOptions : (e: T) => (e as unknown as { sets: string[] }).sets;
  const options: PostprocessSetOptions<T> = (typeof accOrOptions !== 'function' ? accOrOptions : o) ?? {};

  const sets: Record<string, T[]> = Object.create(null);

  elements.forEach((elem) => {
    acc(elem).forEach((set) => {
      const s = typeof set === 'string' ? set : String(set);
      const r = sets[s];
      if (r == null) {
        sets[s] = [elem];
      } else {
        r.push(elem);
      }
    });
  });
  return postprocessSets(
    Object.entries(sets).map(([set, elems]) => {
      const r: ISet<T> = {
        type: 'set',
        elems,
        name: String(set),
        cardinality: cardinality(elems, o.sumBy),
      };
      return r;
    }),
    options
  );
}
