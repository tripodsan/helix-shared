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

const URI = require('uri-js');
const YAML = require('yaml');
const { YAMLMap, Pair } = require('yaml/types');
const { GitUrl } = require('@tripod/helix-shared-git');
const { pruneEmptyValues } = require('@tripod/helix-shared-utils');
const Origin = require('./Origin.js');
const Static = require('./Static.js');
const Performance = require('./Performance.js');
const Redirect = require('./Redirect.js');
const Condition = require('./Condition.js');

/**
 * Strain
 */
class Strain {
  constructor(cfg) {
    this._name = cfg.name;
    if (cfg.origin) {
      // proxy
      this._origin = new Origin(cfg.origin);
    } else {
      this._origin = null;
      this._content = new GitUrl(cfg.content, { ref: 'master' });
      this._code = new GitUrl(cfg.code, { ref: 'master' });
      // todo: 1. do we still need whilelists?
      this._static = new Static(cfg.static);
      // detect changes in static URL
      this._static.on('url-change', () => {
        this._modified('static', this._static);
      });
      this._directoryIndex = cfg.directoryIndex;
      this._package = cfg.package || '';
    }

    // todo: schema for perf
    this._perf = new Performance(cfg.perf);
    this._condition = cfg.condition ? new Condition(cfg.condition) : null;

    if (cfg.url) {
      throw new Error('url property is no longer supported.');
    }

    this._sticky = cfg.sticky;

    this._redirects = (Array.isArray(cfg.redirects) ? cfg.redirects : [])
      .map((r) => new Redirect(r));

    this._urls = new Set(Array.isArray(cfg.urls) ? cfg.urls.map(URI.normalize) : []);
    this._params = Array.isArray(cfg.params) ? cfg.params : [];
    this._versionLock = cfg['version-lock'];
    this._yamlNode = null;
    // define them initially, and clear for alias node
    // todo: improve
    this._ownProperties = new Set([
      'name',
      'origin',
      'code',
      'content',
      'static',
      'package',
      'perf',
      'condition',
      'sticky',
      'urls',
      'params',
      'redirects',
      'version-lock',
    ]);
  }

  clone() {
    const strain = new Strain(this.toJSON({ keepFormat: true }));
    if (this._directoryIndex) {
      // this is a bit a hack...consider a better binding
      // eslint-disable-next-line no-underscore-dangle
      strain._ownProperties.add('directoryIndex');
    }
    // another neccessary hack
    // eslint-disable-next-line no-underscore-dangle
    strain._sticky = this._sticky;
    return strain;
  }

  get urls() {
    return Array.from(this._urls);
  }

  set urls(value) {
    if (Array.isArray(value)) {
      this._urls = new Set(value.map(URI.normalize));
    } else {
      this._urls = new Set([value].map(URI.normalize));
    }
  }

  get sticky() {
    // when `sticky` is not set
    // assume the strain to be sticky when the condition is
    return this._sticky === undefined && this._condition !== null
      ? this._condition.sticky()
      : !!this._sticky;
  }

  /**
   * Name of this strain.
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  /**
   * GitUrl of the content repository
   * @returns {GitUrl}
   */
  get content() {
    return this._content;
  }

  set content(url) {
    this._content = url;
    this._modified('content', url);
  }

  /**
   * GitUrl of the code repository
   * @returns {GitUrl}
   */
  get code() {
    return this._code;
  }

  set code(code) {
    this._code = code;
    this._modified('code', code);
  }

  /**
   * Static information of this strain
   * @returns {Static}
   */
  get static() {
    return this._static;
  }

  get package() {
    return this._package;
  }

  set package(value) {
    this._package = value;
    this._modified('package', value);
  }

  get params() {
    return this._params;
  }

  get condition() {
    return this._condition;
  }

  set condition(value) {
    this._condition = value;
  }

  get directoryIndex() {
    return this._directoryIndex || 'index.html';
  }

  set directoryIndex(value) {
    this._directoryIndex = value;
    this._modified('directoryIndex', value);
  }

  get perf() {
    return this._perf;
  }

  get origin() {
    return this._origin;
  }

  isProxy() {
    return this._origin !== null;
  }

  get redirects() {
    return this._redirects;
  }

  get versionLock() {
    return this._versionLock;
  }

  /**
   * JSON Serialization of a Strain
   * @typedef Strain~JSON
   * @property {String} name
   * @property {String} code
   * @property {GitUrl~JSON} content
   * @property {Static~JSON} static
   * @property {String} condition
   * @property {String} directoryIndex
   * @property {Performance~JSON} perf
   * @property {Origin~JSON} origin
   */

  /**
   * Returns a json representation
   * @returns {Strain~JSON}
   */
  toJSON(opts) {
    const json = {
      name: this.name,
      sticky: this.sticky,
      condition: this.condition ? this.condition.toJSON(opts) : '',
      perf: this.perf.toJSON(opts),
      urls: this.urls,
    };
    if (this.params.length > 0) {
      json.params = this.params;
    }
    if (this.redirects.length > 0) {
      json.redirects = this.redirects.map((r) => r.toJSON());
    }
    if (this.isProxy()) {
      return { origin: this.origin.toJSON(opts), ...json };
    }
    if (this.versionLock) {
      json['version-lock'] = this.versionLock;
    }
    const ret = {
      code: this.code.toJSON(opts),
      content: this.content.toJSON(opts),
      static: this.static.toJSON(opts),
      directoryIndex: this.directoryIndex,
      package: this.package,
      ...json,
    };
    if (opts && opts.minimal) {
      return pruneEmptyValues(ret);
    }
    return ret;
  }

  _modified(propertyName, propertyValue) {
    if (propertyName && propertyValue) {
      this._ownProperties.add(propertyName);
    }

    if (this._yamlNode) {
      const node = this._yamlNode;
      this._ownProperties.forEach((key) => {
        const idx = node.items.findIndex((i) => i.key === key
          || (i.key.value && i.key.value === key));
        let value = key === 'version-lock' ? this.versionLock : this[key];
        value = key === 'sticky' ? this._sticky : value;
        if (value && value.toYAMLNode) {
          value = value.toYAMLNode();
        }
        if (Array.isArray(value) && value.length === 0) {
          value = null;
        }
        if (value || (value === false && key === 'sticky')) {
          if (idx >= 0) {
            const item = node.items[idx];
            const oldValue = item.value.type === 'ALIAS' ? item.value.source : item.value;
            if (oldValue.toString() !== value.toString()) {
              item.value = value;
            }
          } else {
            node.items.push(new Pair(key, value));
          }
        } else if (idx >= 0) {
          node.items.splice(idx, 1);
        }
      });
    }

    if (propertyName && !propertyValue) {
      this._ownProperties.clear(propertyName);
    }
  }

  toYAML() {
    return YAML.stringify(this.toYAMLNode());
  }

  static fromYAMLNode(node) {
    /* eslint-disable no-underscore-dangle */
    const json = node.toJSON();
    const strain = new Strain(json);
    strain._yamlNode = node;
    strain._ownProperties.clear();
    if (node.type === 'MAP') {
      // remember our 'own' properties
      node.items.forEach((pair) => {
        strain._ownProperties.add(pair.key.value);
      });
      strain._ownProperties.delete('<<');
    }
    /* eslint-enable no-underscore-dangle */
    return strain;
  }

  toYAMLNode() {
    if (!this._yamlNode) {
      this._yamlNode = new YAMLMap();
      this._modified();
    }
    return this._yamlNode;
  }
}

module.exports = Strain;
