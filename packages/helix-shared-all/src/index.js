/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const { GitUrl } = require('@tripod/helix-shared-git');
const utils = require('@tripod/helix-shared-utils');
const wrap = require('@tripod/helix-shared-wrap');
const processQueue = require('@tripod/helix-shared-process-queue');
const HelixConfig = require('./HelixConfig.js');
const IndexConfig = require('./IndexConfig');
const MountConfig = require('./MountConfig');
const RedirectConfig = require('./RedirectConfig');
const Strain = require('./Strain.js');
const string = require('./string.js');
const dom = require('./dom.js');
const Async = require('./async.js');
const MarkupConfig = require('./MarkupConfig');
const Condition = require('./Condition.js');
const { optionalConfig, requiredConfig } = require('./config-wrapper');
const { bodyData } = require('./body-data-wrapper');

module.exports = {
  GitUrl,
  HelixConfig,
  IndexConfig,
  MountConfig,
  RedirectConfig,
  Strain,
  string,
  dom,
  utils,
  MarkupConfig,
  async: Async,
  Condition,
  wrap,
  optionalConfig,
  requiredConfig,
  processQueue,
  bodyData,
};
