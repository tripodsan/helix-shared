/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */

const assert = require('assert');
const index = require('../src/index.js');

describe('Index tests', () => {
  it('exports all modules', () => {
    const exports = [
      'GitUrl',
      'HelixConfig',
      'IndexConfig',
      'MountConfig',
      'RedirectConfig',
      'Strain',
      'string',
      'dom',
      'utils',
      'MarkupConfig',
      'async',
      'Condition',
      'wrap',
      'optionalConfig',
      'requiredConfig',
      'processQueue',
      'bodyData',
    ];
    assert.deepEqual(Object.keys(index), exports);
    assert.deepEqual(exports.filter((name) => (!(name in index))), []);
  });
});
