(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
/**
* @vue/shared v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
const toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseCompareCollections(a, b) {
  if (a.size !== b.size) return false;
  const candidates = Array.from(b);
  const matched = new Uint8Array(candidates.length);
  for (const item of a) {
    let index = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (!matched[i] && looseEqual(item, candidates[i])) {
        index = i;
        break;
      }
    }
    if (index < 0) return false;
    matched[index] = 1;
  }
  return true;
}
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray$1(a);
  bValidType = isArray$1(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    aValidType = isMap(a);
    bValidType = isMap(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareCollections(a, b) : false;
    }
    aValidType = isSet(a);
    bValidType = isSet(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareCollections(a, b) : false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray$1(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray$1(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
};
/**
* @vue/reactivity v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          const scopes = this.scopes.slice();
          for (i = 0, l = scopes.length; i < l; i++) {
            scopes[i].resume();
          }
        }
        const effects = this.effects.slice();
        for (i = 0, l = effects.length; i < l; i++) {
          effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l = computed2.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray$1(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = /* @__PURE__ */ toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray$1(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = /* @__PURE__ */ toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
    args[0] = /* @__PURE__ */ toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = /* @__PURE__ */ toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (/* @__PURE__ */ isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray$1(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
      if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
        oldValue = /* @__PURE__ */ toRaw(oldValue);
        value = /* @__PURE__ */ toRaw(value);
      }
      if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (target === /* @__PURE__ */ toRaw(receiver) && result) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = /* @__PURE__ */ toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = /* @__PURE__ */ toRaw(this);
        const proto = getProto(target);
        const rawValue = /* @__PURE__ */ toRaw(value);
        const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          value = /* @__PURE__ */ toRaw(value);
        }
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = /* @__PURE__ */ toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
// @__NO_SIDE_EFFECTS__
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
    newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (/* @__PURE__ */ isRef(source)) {
    getter = () => source.value;
    forceTrigger = /* @__PURE__ */ isShallow(source);
  } else if (/* @__PURE__ */ isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
    getter = () => source.map((s) => {
      if (/* @__PURE__ */ isRef(s)) {
        return s.value;
      } else if (/* @__PURE__ */ isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect2.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect2);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      const res = _cb(...args);
      watchHandle();
      return res;
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect2;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect2.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (/* @__PURE__ */ isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
/**
* @vue/runtime-core v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (/* @__PURE__ */ isRef(value)) {
    value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = /* @__PURE__ */ toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray$1(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex$1(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex$1(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    for (let i = 0; i < cb.length; i++) {
      pendingPostFlushCbs.push(cb[i]);
    }
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      for (let i = 0; i < deduped.length; i++) {
        activePostFlushCbs.push(deduped[i]);
      }
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    const prevStackSize = blockStack.length;
    let res;
    try {
      res = fn(...args);
    } finally {
      for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
const enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
const recursiveGetSubtree = (instance) => {
  const subTree = instance.subTree;
  return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
};
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      const child = children && children.length ? findNonCommentChild(children) : (
        // Keep explicit default-slot conditionals on the same transition path
        // as regular v-if branches, which render a comment placeholder.
        instance.subTree ? createCommentVNode() : void 0
      );
      if (!child) {
        return;
      }
      const rawProps = /* @__PURE__ */ toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getInnerChild$1(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      let enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance,
        // #11061, ensure enterHooks is fresh after clone
        (hooks) => enterHooks = hooks
      );
      if (innerChild.type !== Comment) {
        setTransitionHooks(innerChild, enterHooks);
      }
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
        let leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 8)) {
              instance.update();
            }
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
            enterHooks.delayedLeave = () => {
              delayedLeave();
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
          };
        } else {
          oldInnerChild = void 0;
        }
      } else if (oldInnerChild) {
        oldInnerChild = void 0;
      }
      return child;
    };
  }
};
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$1(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      if (leavingVNodesCache[key] === vnode) return;
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      el[enterCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey] = void 0;
      };
      const done = el[enterCbKey].bind(null, false);
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el[enterCbKey]) {
        el[enterCbKey](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      const done = el[leaveCbKey].bind(null, false);
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      const hooks2 = resolveTransitionHooks(
        vnode2,
        props,
        state,
        instance,
        postClone
      );
      if (postClone) postClone(hooks2);
      return hooks2;
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    const subTree = vnode.component.subTree;
    setTransitionHooks(
      isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree,
      hooks
    );
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction(options) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = /* @__PURE__ */ toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref22, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (/* @__PURE__ */ isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref3);
    const _isRef = /* @__PURE__ */ isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef() || !rawRef.k ? ref3.value : refs[rawRef.k];
          if (isUnmount) {
            isArray$1(existing) && remove(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref3, rawRef.k)) {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref3, rawRef.k)) {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    {
      const selfName = getComponentName(
        Component,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray$1(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !/* @__PURE__ */ isShallow(source);
      isReadonlySource = /* @__PURE__ */ isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data)) ;
    else {
      instance.data = /* @__PURE__ */ reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (/* @__PURE__ */ isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions$1(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions$1(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions$1(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = args.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2);
  key = key === "Once" ? key : key.replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false) ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return /* @__PURE__ */ shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    const child = isTeleport(root.type) ? getInnerChild$1(root) || root : root;
    setTransitionHooks(child, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = /* @__PURE__ */ toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray$1(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot$1 = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (
      // #6385 the old vnode may be a user-wrapped non-isomorphic block
      // Force full diff when block metadata is unstable.
      dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)
    ) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        if (transition.persisted && !el[leaveCbKey]) {
          hostInsert(el, container, anchor);
        } else {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        }
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          const wasLeaving = el._isLeaving || !!el[leaveCbKey];
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          if (transition.persisted && !wasLeaving) {
            remove22();
          } else {
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          }
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing = false;
  const render = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs(instance);
      flushPostFlushCbs();
      isFlushing = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString(ref3) || /* @__PURE__ */ isRef(ref3) || isFunction(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (/* @__PURE__ */ isProxy(style) && !isArray$1(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray$1(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    if (shapeFlag & (1 | 64)) {
      normalizeChildren(vnode, { default: children });
      return;
    }
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          setInSSRSetupState(true);
          try {
            handleSetupResult(instance, resolvedResult, isSSR);
          } finally {
            setInSSRSetupState(false);
          }
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray$1(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}
const version = "3.5.42";
/**
* @vue/runtime-dom v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const decorate$1 = (t) => {
  t.displayName = "Transition";
  t.props = TransitionPropsValidators;
  return t;
};
const Transition = /* @__PURE__ */ decorate$1(
  (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)
);
const callHook = (hook, args = []) => {
  if (isArray$1(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray$1(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = (el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
        }
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout != null) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
  const targetDocument = el ? el.ownerDocument : document;
  return targetDocument.body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
const vShow = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(el, { value }, { transition }) {
    el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue) return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el[vShowOriginalDisplay] : "none";
  el[vShowHidden] = !value;
}
const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle(style, key, value);
        }
      } else {
        setStyle(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$1(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      if (importantRE.test(val)) {
        style.setProperty(name, val.replace(importantRE, ""), "important");
      } else {
        style.setProperty(name, val);
      }
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(Once|Passive|Capture)$/;
const optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  let m;
  while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
    if (!options) options = {};
    name = name.slice(0, name.length - m[1].length);
    options[m[1].toLowerCase()] = true;
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    const value = invoker.value;
    if (isArray$1(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      const handlers = value.slice();
      const args = [e];
      for (let i = 0; i < handlers.length; i++) {
        if (e._stopped) {
          break;
        }
        const handler = handlers[i];
        if (handler) {
          callWithAsyncErrorHandling(
            handler,
            instance,
            5,
            args
          );
        }
      }
    } else {
      callWithAsyncErrorHandling(
        value,
        instance,
        5,
        [e]
      );
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray$1(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
const initialValueKey = /* @__PURE__ */ Symbol("_initialValue");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    if (el.parentNode) {
      if (el.type === "text") {
        el[initialValueKey] = el.defaultValue.replace(/[\r\n]/g, "");
      } else if (el.type === "textarea") {
        el[initialValueKey] = el.defaultValue.replace(/\r\n?/g, "\n");
      }
    }
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value, modifiers: { trim, number } }) {
    const newValue = value == null ? "" : value;
    const initialValue = el[initialValueKey];
    delete el[initialValueKey];
    if (initialValue !== void 0 && (el.type === "text" || el.type === "textarea") && el.value !== initialValue) {
      el[assignKey](castValue(el.value, trim, number));
    } else {
      el.value = newValue;
    }
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const vModelCheckbox = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign2 = el[assignKey];
      if (isArray$1(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign2(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign2(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign2(cloned);
      } else {
        assign2(getCheckboxValue(el, checked));
      }
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  let checked;
  if (isArray$1(value)) {
    checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    checked = value.has(vnode.props.value);
  } else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) {
    el.checked = checked;
  }
}
const vModelSelect = {
  // <select multiple> value need to be deep traversed
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    el._modelValue = value;
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue(o)) : getValue(o)
      );
      const multiple = el.multiple;
      const assignedValue = multiple ? isSet(el._modelValue) ? new Set(selectedVal) : selectedVal : selectedVal[0];
      const pending = el._pendingValue = [
        multiple,
        multiple ? isArray$1(assignedValue) ? selectedVal.slice() : selectedVal : assignedValue
      ];
      try {
        el[assignKey](assignedValue);
      } finally {
        nextTick(() => {
          if (el._pendingValue === pending) {
            el._pendingValue = void 0;
          }
        });
      }
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, { value }, vnode) {
    el._modelValue = value;
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    const pending = el._pendingValue;
    el._pendingValue = void 0;
    if (!pending || pending[0] !== el.multiple || !isSameSelectValue(value, pending[1], pending[0])) {
      setSelected(el, value);
    }
  }
};
function isSameSelectValue(value, assignedValue, multiple) {
  if (!multiple) return looseEqual(value, assignedValue);
  if (isArray$1(value)) return looseEqual(value, assignedValue);
  if (isSet(value)) {
    if (value.size !== assignedValue.length) return false;
    for (const item of assignedValue) {
      if (!value.has(item)) return false;
    }
    return true;
  }
  return false;
}
function setSelected(el, value) {
  const isMultiple = el.multiple;
  const isArrayValue = isArray$1(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArrayValue) {
        const optionType = typeof optionValue;
        if (optionType === "string" || optionType === "number") {
          option.selected = value.some((v) => String(v) === String(optionValue));
        } else {
          option.selected = looseIndexOf(value, optionValue) > -1;
        }
      } else {
        option.selected = value.has(optionValue);
      }
    } else if (looseEqual(getValue(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  }));
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  const cache = fn._withKeys || (fn._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some(
      (k) => k === eventKey || keyNames[k] === eventKey
    )) {
      return fn(event);
    }
  }));
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
const isBrowser = typeof document !== "undefined";
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module" || obj.default && isRouteComponent(obj.default);
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop = () => {
};
const isArray = Array.isArray;
function mergeOptions(defaults, partialOptions) {
  const options = {};
  for (const key in defaults) options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  return options;
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return text == null ? "" : encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  if (text == null) return null;
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery$1, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location2.indexOf("#");
  let searchPos = location2.indexOf("?");
  searchPos = hashPos >= 0 && searchPos > hashPos ? -1 : searchPos;
  if (searchPos >= 0) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos, hashPos > 0 ? hashPos : location2.length);
    query = parseQuery$1(searchString.slice(1));
  }
  if (hashPos >= 0) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + searchString + hash,
    path,
    query,
    hash: decode(hash)
  };
}
function stringifyURL(stringifyQuery$1, location2) {
  const query = location2.query ? stringifyQuery$1(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase())) return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery$1, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery$1(a.query) === stringifyQuery$1(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  for (var key in a) if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return isArray(a) ? isEquivalentArray(a, b) : isArray(b) ? isEquivalentArray(b, a) : (a == null ? void 0 : a.valueOf()) === (b == null ? void 0 : b.valueOf());
}
function isEquivalentArray(a, b) {
  return isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/")) return to;
  if (!to) return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  const lastToSegment = toSegments[toSegments.length - 1];
  if (lastToSegment === ".." || lastToSegment === ".") toSegments.push("");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".") continue;
    if (segment === "..") {
      if (position > 1) position--;
    } else break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition).join("/");
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
let NavigationType = /* @__PURE__ */ (function(NavigationType$1) {
  NavigationType$1["pop"] = "pop";
  NavigationType$1["push"] = "push";
  return NavigationType$1;
})({});
let NavigationDirection = /* @__PURE__ */ (function(NavigationDirection$1) {
  NavigationDirection$1["back"] = "back";
  NavigationDirection$1["forward"] = "forward";
  NavigationDirection$1["unknown"] = "";
  return NavigationDirection$1;
})({});
function normalizeBase(base) {
  if (!base) if (isBrowser) {
    const baseEl = document.querySelector("base");
    base = baseEl && baseEl.getAttribute("href") || "/";
    base = base.replace(/^\w+:\/\/[^\/]+/, "");
  } else base = "/";
  if (base[0] !== "/" && base[0] !== "#") base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.scrollX,
  top: window.scrollY
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else scrollToOptions = position;
  if ("scrollBehavior" in document.documentElement.style) window.scrollTo(scrollToOptions);
  else window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.scrollX, scrollToOptions.top != null ? scrollToOptions.top : window.scrollY);
}
function getScrollKey(path, delta) {
  return (history.state ? history.state.position - delta : -1) + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
let ErrorTypes = /* @__PURE__ */ (function(ErrorTypes$1) {
  ErrorTypes$1[ErrorTypes$1["MATCHER_NOT_FOUND"] = 1] = "MATCHER_NOT_FOUND";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_GUARD_REDIRECT"] = 2] = "NAVIGATION_GUARD_REDIRECT";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_ABORTED"] = 4] = "NAVIGATION_ABORTED";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_CANCELLED"] = 8] = "NAVIGATION_CANCELLED";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_DUPLICATED"] = 16] = "NAVIGATION_DUPLICATED";
  return ErrorTypes$1;
})({});
const NavigationFailureSymbol = Symbol("");
({
  [ErrorTypes.MATCHER_NOT_FOUND]({ location: location2, currentLocation }) {
    return `No match for
 ${JSON.stringify(location2)}${currentLocation ? "\nwhile being at\n" + JSON.stringify(currentLocation) : ""}`;
  },
  [ErrorTypes.NAVIGATION_GUARD_REDIRECT]({ from, to }) {
    return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
  },
  [ErrorTypes.NAVIGATION_ABORTED]({ from, to }) {
    return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
  },
  [ErrorTypes.NAVIGATION_CANCELLED]({ from, to }) {
    return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
  },
  [ErrorTypes.NAVIGATION_DUPLICATED]({ from, to }) {
    return `Avoided redundant navigation to current location: "${from.fullPath}".`;
  }
});
function createRouterError(type, params) {
  return assign(/* @__PURE__ */ new Error(), {
    type,
    [NavigationFailureSymbol]: true
  }, params);
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const propertiesToLog = [
  "params",
  "query",
  "hash"
];
function stringifyRoute(to) {
  if (typeof to === "string") return to;
  if (to.path != null) return to.path;
  const location2 = {};
  for (const key of propertiesToLog) if (key in to) location2[key] = to[key];
  return JSON.stringify(location2, null, 2);
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?") return query;
  const searchParams = (search[0] === "?" ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray(currentValue)) currentValue = query[key] = [currentValue];
      currentValue.push(value);
    } else query[key] = value;
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) search += (search.length ? "&" : "") + key;
      continue;
    }
    (isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)]).forEach((value$1) => {
      if (value$1 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value$1 != null) search += "=" + value$1;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) normalizedQuery[key] = isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1) handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add,
    list: () => handlers.slice(),
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name, runWithContext = (fn) => fn()) {
  const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = (valid) => {
      if (valid === false) reject(createRouterError(ErrorTypes.NAVIGATION_ABORTED, {
        from,
        to
      }));
      else if (valid instanceof Error) reject(valid);
      else if (isRouteLocation(valid)) reject(createRouterError(ErrorTypes.NAVIGATION_GUARD_REDIRECT, {
        from: to,
        to: valid
      }));
      else {
        if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") enterCallbackArray.push(valid);
        resolve2();
      }
    };
    const guardReturn = runWithContext(() => guard.call(record && record.instances[name], to, from, next));
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3) guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from, runWithContext = (fn) => fn()) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name]) continue;
      if (isRouteComponent(rawComponent)) {
        const guard = (rawComponent.__vccOpts || rawComponent)[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name, runWithContext));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved) throw new Error(`Couldn't resolve component "${name}" at "${record.path}"`);
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.mods[name] = resolved;
          record.components[name] = resolvedComponent;
          const guard = (resolvedComponent.__vccOpts || resolvedComponent)[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name, runWithContext)();
        }));
      }
    }
  }
  return guards;
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) if (to.matched.find((record) => isSameRouteRecord(record, recordFrom))) updatingRecords.push(recordFrom);
    else leavingRecords.push(recordFrom);
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) enteringRecords.push(recordTo);
    }
  }
  return [
    leavingRecords,
    updatingRecords,
    enteringRecords
  ];
}
/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location$1) {
  const { pathname, search, hash } = location$1;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/") pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  return stripBase(pathname, base) + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else replace(to);
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    if (document.visibilityState === "hidden") {
      const { history: history$1 } = window;
      if (!history$1.state) return;
      history$1.replaceState(assign({}, history$1.state, { scroll: computeScrollPosition() }), "");
    }
  }
  function destroy() {
    for (const teardown of teardowns) teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("pagehide", beforeUnloadListener);
    document.removeEventListener("visibilitychange", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("pagehide", beforeUnloadListener);
  document.addEventListener("visibilitychange", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history$1, location: location$1 } = window;
  const currentLocation = { value: createCurrentLocation(base, location$1) };
  const historyState = { value: history$1.state };
  if (!historyState.value) changeLocation(currentLocation.value, {
    back: null,
    current: currentLocation.value,
    forward: null,
    position: history$1.length - 1,
    replaced: true,
    scroll: null
  }, true);
  function changeLocation(to, state, replace$1) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location$1.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
    try {
      history$1[replace$1 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      console.error(err);
      location$1[replace$1 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    changeLocation(to, assign({}, history$1.state, buildState(historyState.value.back, to, historyState.value.forward, true), data, { position: historyState.value.position }), true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign({}, historyState.value, history$1.state, {
      forward: to,
      scroll: computeScrollPosition()
    });
    changeLocation(currentState.current, currentState, true);
    changeLocation(to, assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data), false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
let TokenType = /* @__PURE__ */ (function(TokenType$1) {
  TokenType$1[TokenType$1["Static"] = 0] = "Static";
  TokenType$1[TokenType$1["Param"] = 1] = "Param";
  TokenType$1[TokenType$1["Group"] = 2] = "Group";
  return TokenType$1;
})({});
var TokenizerState = /* @__PURE__ */ (function(TokenizerState$1) {
  TokenizerState$1[TokenizerState$1["Static"] = 0] = "Static";
  TokenizerState$1[TokenizerState$1["Param"] = 1] = "Param";
  TokenizerState$1[TokenizerState$1["ParamRegExp"] = 2] = "ParamRegExp";
  TokenizerState$1[TokenizerState$1["ParamRegExpEnd"] = 3] = "ParamRegExpEnd";
  TokenizerState$1[TokenizerState$1["EscapeNext"] = 4] = "EscapeNext";
  return TokenizerState$1;
})(TokenizerState || {});
const ROOT_TOKEN = {
  type: TokenType.Static,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path) return [[]];
  if (path === "/") return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) throw new Error(`Invalid path "${path}"`);
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = TokenizerState.Static;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment) tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer) return;
    if (state === TokenizerState.Static) segment.push({
      type: TokenType.Static,
      value: buffer
    });
    else if (state === TokenizerState.Param || state === TokenizerState.ParamRegExp || state === TokenizerState.ParamRegExpEnd) {
      if (segment.length > 1 && (char === "*" || char === "+")) crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: TokenType.Param,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else crash("Invalid state to consume buffer");
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== TokenizerState.ParamRegExp) {
      previousState = state;
      state = TokenizerState.EscapeNext;
      continue;
    }
    switch (state) {
      case TokenizerState.Static:
        if (char === "/") {
          if (buffer) consumeBuffer();
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = TokenizerState.Param;
        } else addCharToBuffer();
        break;
      case TokenizerState.EscapeNext:
        addCharToBuffer();
        state = previousState;
        break;
      case TokenizerState.Param:
        if (char === "(") state = TokenizerState.ParamRegExp;
        else if (VALID_PARAM_RE.test(char)) addCharToBuffer();
        else {
          consumeBuffer();
          state = TokenizerState.Static;
          if (char !== "*" && char !== "?" && char !== "+") i--;
        }
        break;
      case TokenizerState.ParamRegExp:
        if (char === ")") if (customRe[customRe.length - 1] == "\\") customRe = customRe.slice(0, -1) + char;
        else state = TokenizerState.ParamRegExpEnd;
        else customRe += char;
        break;
      case TokenizerState.ParamRegExpEnd:
        consumeBuffer();
        state = TokenizerState.Static;
        if (char !== "*" && char !== "?" && char !== "+") i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === TokenizerState.ParamRegExp) crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
var PathScore = /* @__PURE__ */ (function(PathScore$1) {
  PathScore$1[PathScore$1["_multiplier"] = 10] = "_multiplier";
  PathScore$1[PathScore$1["Root"] = 90] = "Root";
  PathScore$1[PathScore$1["Segment"] = 40] = "Segment";
  PathScore$1[PathScore$1["SubSegment"] = 30] = "SubSegment";
  PathScore$1[PathScore$1["Static"] = 40] = "Static";
  PathScore$1[PathScore$1["Dynamic"] = 20] = "Dynamic";
  PathScore$1[PathScore$1["BonusCustomRegExp"] = 10] = "BonusCustomRegExp";
  PathScore$1[PathScore$1["BonusWildcard"] = -50] = "BonusWildcard";
  PathScore$1[PathScore$1["BonusRepeatable"] = -20] = "BonusRepeatable";
  PathScore$1[PathScore$1["BonusOptional"] = -8] = "BonusOptional";
  PathScore$1[PathScore$1["BonusStrict"] = 0.7000000000000001] = "BonusStrict";
  PathScore$1[PathScore$1["BonusCaseSensitive"] = 0.25] = "BonusCaseSensitive";
  return PathScore$1;
})(PathScore || {});
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [PathScore.Root];
    if (options.strict && !segment.length) pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = PathScore.Segment + (options.sensitive ? PathScore.BonusCaseSensitive : 0);
      if (token.type === TokenType.Static) {
        if (!tokenIndex) pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += PathScore.Static;
      } else if (token.type === TokenType.Param) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re$1 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re$1 !== BASE_PARAM_PATTERN) {
          subSegmentScore += PathScore.BonusCustomRegExp;
          try {
            `${re$1}`;
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re$1}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re$1})(?:/(?:${re$1}))*)` : `(${re$1})`;
        if (!tokenIndex) subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional) subPattern += "?";
        pattern += subPattern;
        subSegmentScore += PathScore.Dynamic;
        if (optional) subSegmentScore += PathScore.BonusOptional;
        if (repeatable) subSegmentScore += PathScore.BonusRepeatable;
        if (re$1 === ".*") subSegmentScore += PathScore.BonusWildcard;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += PathScore.BonusStrict;
  }
  if (!options.strict) pattern += "/?";
  if (options.end) pattern += "$";
  else if (options.strict && !pattern.endsWith("/")) pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match) return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/")) path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) if (token.type === TokenType.Static) path += token.value;
      else if (token.type === TokenType.Param) {
        const { value, repeatable, optional } = token;
        const param = value in params ? params[value] : "";
        if (isArray(param) && !repeatable) throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
        const text = isArray(param) ? param.join("/") : param;
        if (!text) if (optional) {
          if (segment.length < 2) if (path.endsWith("/")) path = path.slice(0, -1);
          else avoidDuplicatedSlash = true;
        } else throw new Error(`Missing required param "${value}"`);
        path += text;
      }
    }
    return path || "/";
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff) return diff;
    i++;
  }
  if (a.length < b.length) return a.length === 1 && a[0] === PathScore.Static + PathScore.Segment ? -1 : 1;
  else if (a.length > b.length) return b.length === 1 && b[0] === PathScore.Static + PathScore.Segment ? 1 : -1;
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp) return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore)) return 1;
    if (isLastScoreNegative(bScore)) return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const PATH_PARSER_OPTIONS_DEFAULTS = {
  strict: false,
  end: true,
  sensitive: false
};
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf) parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions(PATH_PARSER_OPTIONS_DEFAULTS, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [mainNormalizedRecord];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) normalizedRecords.push(normalizeRouteRecord(assign({}, mainNormalizedRecord, {
        components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
        path: alias,
        aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
      })));
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher) originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher)) {
          removeRoute(record.name);
        }
      }
      if (isMatchable(matcher)) insertMatcher(matcher);
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
      }
      originalRecord = originalRecord || matcher;
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    const index = findInsertionIndex(matcher, matchers);
    matchers.splice(index, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher)) matcherMap.set(matcher.record.name, matcher);
  }
  function resolve2(location$1, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location$1 && location$1.name) {
      matcher = matcherMap.get(location$1.name);
      if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, { location: location$1 });
      name = matcher.record.name;
      params = assign(pickParams(currentLocation.params, matcher.keys.filter((k) => !k.optional).concat(matcher.parent ? matcher.parent.keys.filter((k) => k.optional) : []).map((k) => k.name)), location$1.params && pickParams(location$1.params, matcher.keys.map((k) => k.name)));
      path = matcher.stringify(params);
    } else if (location$1.path != null) {
      path = location$1.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, {
        location: location$1,
        currentLocation
      });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location$1.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  function clearRoutes() {
    matchers.length = 0;
    matcherMap.clear();
  }
  return {
    addRoute,
    resolve: resolve2,
    removeRoute,
    clearRoutes,
    getRoutes,
    getRecordMatcher
  };
}
function pickParams(params, keys) {
  const newParams = {};
  for (const key of keys) if (key in params) newParams[key] = params[key];
  return newParams;
}
function normalizeRouteRecord(record) {
  const normalized = {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: record.aliasOf,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
  Object.defineProperty(normalized, "mods", { value: {} });
  return normalized;
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) propsObject.default = props;
  else for (const name in record.components) propsObject[name] = typeof props === "object" ? props[name] : props;
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf) return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function findInsertionIndex(matcher, matchers) {
  let lower = 0;
  let upper = matchers.length;
  while (lower !== upper) {
    const mid = lower + upper >> 1;
    if (comparePathParserScore(matcher, matchers[mid]) < 0) upper = mid;
    else lower = mid + 1;
  }
  const insertionAncestor = getInsertionAncestor(matcher);
  if (insertionAncestor) {
    upper = matchers.lastIndexOf(insertionAncestor, upper - 1);
  }
  return upper;
}
function getInsertionAncestor(matcher) {
  let ancestor = matcher;
  while (ancestor = ancestor.parent) if (isMatchable(ancestor) && comparePathParserScore(matcher, ancestor) === 0) return ancestor;
}
function isMatchable({ record }) {
  return !!(record.name || record.components && Object.keys(record.components).length || record.redirect);
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => {
    const to = unref(props.to);
    return router2.resolve(to);
  });
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length) return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1) return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      const p2 = router2[unref(props.replace) ? "replace" : "push"](unref(props.to)).catch(noop);
      if (props.viewTransition && typeof document !== "undefined" && "startViewTransition" in document) document.startViewTransition(() => p2);
      return p2;
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
function preferSingleVNode(vnodes) {
  return vnodes.length === 1 ? vnodes[0] : vnodes;
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    },
    viewTransition: Boolean
  },
  useLink,
  setup(props, { slots }) {
    const link = /* @__PURE__ */ reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && preferSingleVNode(slots.default(link));
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;
  if (e.button !== void 0 && e.button !== 0) return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target)) return;
  }
  if (e.preventDefault) e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue) return false;
    } else if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value.valueOf() !== outerValue[i].valueOf())) return false;
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) initialDepth++;
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = /* @__PURE__ */ ref();
    watch(() => [
      viewRef.value,
      matchedRouteRef.value,
      props.name
    ], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) to.leaveGuards = from.leaveGuards;
          if (!to.updateGuards.size) to.updateGuards = from.updateGuards;
        }
      }
      if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) return normalizeSlot(slots.default, {
        Component: ViewComponent,
        route
      });
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) matchedRoute.instances[currentName] = null;
      };
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return normalizeSlot(slots.default, {
        Component: component,
        route
      }) || component;
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = /* @__PURE__ */ shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) history.scrollRestoration = "manual";
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else record = parentOrRoute;
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) matcher.removeRoute(recordMatcher);
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute$1 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href$1 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute$1, {
        params: decodeParams(matchedRoute$1.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href$1
      });
    }
    let matcherLocation;
    if (rawLocation.path != null) {
      matcherLocation = assign({}, rawLocation, { path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) if (targetParams[key] == null) delete targetParams[key];
      matcherLocation = assign({}, rawLocation, { params: encodeParams(targetParams) });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      hash,
      query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) return createRouterError(ErrorTypes.NAVIGATION_CANCELLED, {
      from,
      to
    });
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to, from) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to, from) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        params: newTargetLocation.path != null ? {} : to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace$1 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation, from);
    if (shouldRedirect) return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
      state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
      force,
      replace: replace$1
    }), redirectedFrom || targetLocation);
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(ErrorTypes.NAVIGATION_DUPLICATED, {
        to: toLocation,
        from
      });
      handleScroll(from, from, true, false);
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure$1) => {
      if (failure$1) {
        if (isNavigationFailure(failure$1, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
          return pushWithRedirect(assign({ replace: replace$1 }, locationAsObject(failure$1.to), {
            state: typeof failure$1.to === "object" ? assign({}, data, failure$1.to.state) : data,
            force
          }), redirectedFrom || toLocation);
        }
      } else failure$1 = finalizeNavigation(toLocation, from, true, replace$1, data);
      triggerAfterEach(toLocation, from, failure$1);
      return failure$1;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function runWithContext(fn) {
    const app = installedApps.values().next().value;
    return app && typeof app.runWithContext === "function" ? app.runWithContext(fn) : fn();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) record.leaveGuards.forEach((guard) => {
      guards.push(guardToPromiseFn(guard, to, from));
    });
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) record.updateGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of enteringRecords) if (record.beforeEnter) if (isArray(record.beforeEnter)) for (const beforeEnter of record.beforeEnter) guards.push(guardToPromiseFn(beforeEnter, to, from));
      else guards.push(guardToPromiseFn(record.beforeEnter, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from, runWithContext);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(err, ErrorTypes.NAVIGATION_CANCELLED) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    afterGuards.list().forEach((guard) => runWithContext(() => guard(to, from, failure)));
  }
  function finalizeNavigation(toLocation, from, isPush, replace$1, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error) return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) if (replace$1 || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll }, data));
    else routerHistory.push(toLocation.fullPath, data);
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener) return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router2.listening) return;
      const toLocation = resolve2(to);
      const shouldRedirect = handleRedirectRecord(toLocation, router2.currentRoute.value);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, {
          replace: true,
          force: true
        }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(error, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_CANCELLED)) return error;
        if (isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
          pushWithRedirect(assign(locationAsObject(error.to), { force: true }), toLocation).then((failure) => {
            if (isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED) && !info.delta && info.type === NavigationType.pop) routerHistory.go(-1, false);
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) routerHistory.go(-info.delta, false);
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(toLocation, from, false);
        if (failure) {
          if (info.delta && !isNavigationFailure(failure, ErrorTypes.NAVIGATION_CANCELLED)) routerHistory.go(-info.delta, false);
          else if (info.type === NavigationType.pop && isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED)) routerHistory.go(-1, false);
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorListeners = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorListeners.list();
    if (list.length) list.forEach((handler) => handler(error, to, from));
    else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED) return Promise.resolve();
    return new Promise((resolve$1, reject) => {
      readyHandlers.add([resolve$1, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve$1, reject]) => err ? reject(err) : resolve$1());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior) return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    clearRoutes: matcher.clearRoutes,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorListeners.add,
    isReady,
    install(app) {
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router2;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) Object.defineProperty(reactiveRoute, key, {
        get: () => currentRoute.value[key],
        enumerable: true
      });
      app.provide(routerKey, router2);
      app.provide(routeLocationKey, /* @__PURE__ */ shallowReactive(reactiveRoute));
      app.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app.unmount;
      installedApps.add(app);
      app.unmount = function() {
        installedApps.delete(app);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
  }
  return router2;
}
function useRouter() {
  return inject(routerKey);
}
function useRoute(_name) {
  return inject(routeLocationKey);
}
const THEME_KEY = "blog_color_theme";
const currentTheme = /* @__PURE__ */ ref("light");
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
}
function applyTheme(theme) {
  currentTheme.value = theme;
  localStorage.setItem(THEME_KEY, theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
function toggleTheme() {
  const next = currentTheme.value === "dark" ? "light" : "dark";
  applyTheme(next);
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$j = { class: "navbar-header" };
const _hoisted_2$j = { class: "nav-container" };
const _hoisted_3$i = { class: "desktop-nav" };
const _hoisted_4$h = { class: "nav-group primary-group" };
const _hoisted_5$h = { class: "nav-group secondary-group" };
const _hoisted_6$g = { class: "nav-actions" };
const _hoisted_7$g = ["title"];
const _hoisted_8$g = { class: "theme-icon" };
const _hoisted_9$g = { class: "hamburger-icon" };
const _hoisted_10$g = {
  key: 0,
  class: "mobile-menu-drawer"
};
const _sfc_main$j = {
  __name: "NavBar",
  setup(__props) {
    const route = useRoute();
    const mobileMenuOpen = /* @__PURE__ */ ref(false);
    const primaryLinks = [
      { name: "模型动态", path: "/" },
      { name: "模型目录", path: "/models" },
      { name: "厂商", path: "/vendors" },
      { name: "时间线", path: "/model-timeline" }
    ];
    const secondaryLinks = [
      { name: "文章", path: "/articles" },
      { name: "作品", path: "/works" },
      { name: "关于", path: "/about" }
    ];
    const navLinks = [...primaryLinks, ...secondaryLinks];
    function isActive(path) {
      if (path === "/") return route.path === "/";
      return route.path.startsWith(path);
    }
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("header", _hoisted_1$j, [
        createBaseVNode("div", _hoisted_2$j, [
          createVNode(_component_router_link, {
            to: "/",
            class: "site-logo"
          }, {
            default: withCtx(() => [..._cache[3] || (_cache[3] = [
              createBaseVNode("span", { class: "logo-name" }, "Simon", -1),
              createBaseVNode("span", { class: "logo-subtag" }, "全球模型动态观察台", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("nav", _hoisted_3$i, [
            createBaseVNode("div", _hoisted_4$h, [
              (openBlock(), createElementBlock(Fragment, null, renderList(primaryLinks, (item) => {
                return createVNode(_component_router_link, {
                  key: item.path,
                  to: item.path,
                  class: normalizeClass(["nav-link-item", { active: isActive(item.path) }])
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.name), 1)
                  ]),
                  _: 2
                }, 1032, ["to", "class"]);
              }), 64))
            ]),
            _cache[5] || (_cache[5] = createBaseVNode("div", { class: "nav-divider" }, null, -1)),
            createBaseVNode("div", _hoisted_5$h, [
              (openBlock(), createElementBlock(Fragment, null, renderList(secondaryLinks, (item) => {
                return createVNode(_component_router_link, {
                  key: item.path,
                  to: item.path,
                  class: normalizeClass(["nav-link-item secondary", { active: isActive(item.path) }])
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(item.name), 1)
                  ]),
                  _: 2
                }, 1032, ["to", "class"]);
              }), 64)),
              _cache[4] || (_cache[4] = createBaseVNode("a", {
                href: "https://github.com",
                target: "_blank",
                class: "nav-link-item secondary github-link"
              }, " GitHub ↗ ", -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_6$g, [
            createBaseVNode("button", {
              class: "theme-switch-btn",
              title: unref(currentTheme) === "dark" ? "切换为浅色模式" : "切换为暗色模式",
              onClick: _cache[0] || (_cache[0] = (...args) => unref(toggleTheme) && unref(toggleTheme)(...args))
            }, [
              createBaseVNode("span", _hoisted_8$g, toDisplayString(unref(currentTheme) === "dark" ? "☀️" : "🌙"), 1)
            ], 8, _hoisted_7$g),
            createBaseVNode("button", {
              class: "mobile-toggle-btn",
              onClick: _cache[1] || (_cache[1] = ($event) => mobileMenuOpen.value = !mobileMenuOpen.value)
            }, [
              createBaseVNode("span", _hoisted_9$g, toDisplayString(mobileMenuOpen.value ? "✕" : "☰"), 1)
            ])
          ])
        ]),
        mobileMenuOpen.value ? (openBlock(), createElementBlock("div", _hoisted_10$g, [
          (openBlock(), createElementBlock(Fragment, null, renderList(navLinks, (item) => {
            return createVNode(_component_router_link, {
              key: item.path,
              to: item.path,
              class: normalizeClass(["mobile-link", { active: isActive(item.path) }]),
              onClick: _cache[2] || (_cache[2] = ($event) => mobileMenuOpen.value = false)
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(item.name), 1)
              ]),
              _: 2
            }, 1032, ["to", "class"]);
          }), 64)),
          _cache[6] || (_cache[6] = createBaseVNode("a", {
            href: "https://github.com",
            target: "_blank",
            class: "mobile-link"
          }, "GitHub ↗", -1))
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const NavBar = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-d29a0d5a"]]);
const _hoisted_1$i = { class: "site-footer" };
const _hoisted_2$i = { class: "footer-inner" };
const _hoisted_3$h = { class: "copyright" };
const _sfc_main$i = {
  __name: "FooterBar",
  setup(__props) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("footer", _hoisted_1$i, [
        createBaseVNode("div", _hoisted_2$i, [
          createBaseVNode("p", _hoisted_3$h, " © " + toDisplayString(unref(currentYear)) + " Simon · Powered by Vue 3 & Spring Boot ", 1),
          _cache[0] || (_cache[0] = createBaseVNode("p", { class: "sub-meta" }, " 记录即思考 · 随缘更新 ", -1))
        ])
      ]);
    };
  }
};
const FooterBar = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-d5f25bbb"]]);
const _hoisted_1$h = { class: "app-layout" };
const _hoisted_2$h = { class: "main-content" };
const _sfc_main$h = {
  __name: "App",
  setup(__props) {
    const scrollProgress = /* @__PURE__ */ ref(0);
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, scrollTop / docHeight * 100)) : 0;
    }
    onMounted(() => {
      initTheme();
      window.addEventListener("scroll", handleScroll, { passive: true });
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", _hoisted_1$h, [
        createBaseVNode("div", {
          class: "reading-progress-bar",
          style: normalizeStyle({ width: scrollProgress.value + "%" })
        }, null, 4),
        createVNode(NavBar),
        createBaseVNode("main", _hoisted_2$h, [
          createVNode(_component_router_view, null, {
            default: withCtx(({ Component }) => [
              createVNode(Transition, {
                name: "page-fade",
                mode: "out-in"
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(Component)))
                ]),
                _: 2
              }, 1024)
            ]),
            _: 1
          })
        ]),
        createVNode(FooterBar)
      ]);
    };
  }
};
const TOKEN_KEY = "blog_admin_token";
const USERNAME_KEY = "blog_admin_user";
function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
function setAuthSession(token, username) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  }
}
function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}
function isLoggedIn() {
  return Boolean(getToken());
}
async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const config = {
    ...options,
    headers
  };
  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      clearAuthSession();
      if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")) {
        window.location.href = "/admin/login";
      }
      const data2 = await response.json().catch(() => ({}));
      throw new Error(data2.message || "登录会话已过期，请重新登录");
    }
    const data = await response.json();
    if (!response.ok || data.code !== void 0 && data.code !== 0) {
      throw new Error(data.message || `请求失败 (${response.status})`);
    }
    return data.data;
  } catch (err) {
    console.error(`[API Error] ${url}:`, err.message);
    throw err;
  }
}
const authApi = {
  async login(username, password) {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (data && data.token) {
      setAuthSession(data.token, data.username);
    }
    return data;
  },
  async check() {
    return request("/api/auth/check");
  },
  logout() {
    clearAuthSession();
  },
  isLoggedIn,
  getToken
};
const aiApi = {
  /**
   * 分页检索事件流
   */
  getEvents(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.append("keyword", params.keyword);
    if (params.vendor) searchParams.append("vendor", params.vendor);
    if (params.modality) searchParams.append("modality", params.modality);
    if (params.type) searchParams.append("type", params.type);
    if (params.page) searchParams.append("page", params.page);
    if (params.size) searchParams.append("size", params.size);
    const query = searchParams.toString();
    return request(`/api/model-updates/events${query ? "?" + query : ""}`);
  },
  /**
   * 获取全部厂商目录
   */
  getVendors() {
    return request("/api/model-updates/vendors");
  },
  /**
   * 获取单个厂商详情
   */
  getVendorDetail(slug) {
    return request(`/api/model-updates/vendors/${encodeURIComponent(slug)}`);
  },
  /**
   * 获取模型目录
   */
  getModels(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.vendorId) searchParams.append("vendorId", params.vendorId);
    if (params.series) searchParams.append("series", params.series);
    const query = searchParams.toString();
    return request(`/api/model-updates/models${query ? "?" + query : ""}`);
  },
  /**
   * 获取单个模型详情
   */
  getModelDetail(id) {
    return request(`/api/model-updates/models/${id}`);
  },
  /**
   * 获取按月归档的历史时间线
   */
  getTimeline() {
    return request("/api/model-updates/timeline");
  },
  /**
   * 获取系统监控与来源健康状态
   */
  getStatus() {
    return request("/api/model-updates/status");
  },
  /**
   * 精确获取单个模型关联的全部事件
   */
  getModelEvents(id) {
    return request(`/api/model-updates/models/${id}/events`);
  },
  /**
   * 公开巡检接口已收敛，推荐使用管理端 triggerAdminCrawl()
   */
  triggerCrawl() {
    return this.triggerAdminCrawl();
  },
  // ========== 管理员专属接口 ==========
  /**
   * 分页获取待审模型发现候选
   */
  getCandidates(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append("status", params.status);
    if (params.keyword) searchParams.append("keyword", params.keyword);
    if (params.page) searchParams.append("page", params.page);
    if (params.size) searchParams.append("size", params.size);
    const query = searchParams.toString();
    return request(`/api/admin/model-updates/candidates${query ? "?" + query : ""}`);
  },
  /**
   * 提交候选审核决定 (APPROVE / REJECT)
   */
  decideCandidate(id, data) {
    return request(`/api/admin/model-updates/candidates/${id}/decision`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  /**
   * 获取管理端官方信源监控列表
   */
  getAdminSources() {
    return request("/api/admin/model-updates/sources");
  },
  /**
   * 切换信源启用/停用状态
   */
  toggleSource(id, active) {
    return request(`/api/admin/model-updates/sources/${id}/toggle?active=${active}`, {
      method: "POST"
    });
  },
  /**
   * 管理员手动触发官方信源全量巡检
   */
  triggerAdminCrawl() {
    return request("/api/admin/model-updates/crawl/trigger", { method: "POST" });
  },
  /**
   * 创建 2026 历史回填任务
   */
  createBackfill(data = {}) {
    return request("/api/admin/model-updates/backfills", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  /**
   * 查询回填任务详情
   */
  getBackfill(id) {
    return request(`/api/admin/model-updates/backfills/${id}`);
  },
  /**
   * 获取全部回填任务记录
   */
  listBackfills() {
    return request("/api/admin/model-updates/backfills");
  },
  /**
   * 获取官方最新动态线索（可按月份 YYYY-MM、厂商过滤）
   */
  getOfficialUpdates(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.month) searchParams.append("month", params.month);
    if (params.vendorId) searchParams.append("vendorId", params.vendorId);
    if (params.category) searchParams.append("category", params.category);
    if (params.keyword) searchParams.append("keyword", params.keyword);
    if (params.page) searchParams.append("page", params.page);
    if (params.size) searchParams.append("size", params.size);
    const query = searchParams.toString();
    return request(`/api/model-updates/official-updates${query ? "?" + query : ""}`);
  },
  /**
   * 获取 2026 各月厂商覆盖审计矩阵
   */
  getCoverage(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.year) searchParams.append("year", params.year);
    if (params.vendorId) searchParams.append("vendorId", params.vendorId);
    const query = searchParams.toString();
    return request(`/api/model-updates/coverage${query ? "?" + query : ""}`);
  }
};
const _hoisted_1$g = { class: "observatory-page" };
const _hoisted_2$g = { class: "obs-hero-canvas" };
const _hoisted_3$g = { class: "obs-hero-grid" };
const _hoisted_4$g = { class: "obs-mission-column" };
const _hoisted_5$g = { class: "obs-quick-links" };
const _hoisted_6$f = {
  key: 0,
  class: "obs-focus-column"
};
const _hoisted_7$f = { class: "focus-top-strip" };
const _hoisted_8$f = { class: "focus-vendor-chip" };
const _hoisted_9$f = { class: "vendor-name" };
const _hoisted_10$f = { class: "focus-date-badge" };
const _hoisted_11$e = { class: "date-text" };
const _hoisted_12$e = { class: "status-clarify" };
const _hoisted_13$d = { class: "focus-model-name" };
const _hoisted_14$d = { class: "focus-summary" };
const _hoisted_15$d = { class: "focus-meta-row" };
const _hoisted_16$c = { class: "focus-tags" };
const _hoisted_17$c = {
  key: 0,
  class: "focus-evidence-link"
};
const _hoisted_18$c = ["href"];
const _hoisted_19$c = { class: "anchor-text" };
const _hoisted_20$c = { class: "obs-status-strip" };
const _hoisted_21$c = { class: "strip-item" };
const _hoisted_22$c = { class: "strip-val" };
const _hoisted_23$c = { class: "strip-item" };
const _hoisted_24$b = { class: "strip-val highlight" };
const _hoisted_25$b = { class: "strip-item" };
const _hoisted_26$a = { class: "strip-val" };
const _hoisted_27$8 = { class: "strip-item" };
const _hoisted_28$8 = { class: "strip-val highlight-amber" };
const _hoisted_29$8 = { class: "strip-item" };
const _hoisted_30$8 = { class: "strip-val time" };
const _hoisted_31$7 = {
  key: 0,
  class: "obs-secondary-section"
};
const _hoisted_32$6 = { class: "secondary-cards-grid" };
const _hoisted_33$4 = ["onClick"];
const _hoisted_34$4 = { class: "sec-card-header" };
const _hoisted_35$4 = { class: "sec-vendor" };
const _hoisted_36$4 = { class: "sec-vendor-name" };
const _hoisted_37$4 = { class: "sec-date" };
const _hoisted_38$4 = { class: "sec-model-name" };
const _hoisted_39$4 = { class: "sec-summary" };
const _hoisted_40$4 = { class: "sec-footer" };
const _hoisted_41$4 = ["href"];
const _hoisted_42$4 = { class: "obs-capability-section" };
const _hoisted_43$3 = { class: "capability-cards-grid" };
const _hoisted_44$3 = ["onClick"];
const _hoisted_45$3 = { class: "cap-icon-box" };
const _hoisted_46$3 = { class: "cap-info" };
const _hoisted_47$2 = { class: "cap-header-line" };
const _hoisted_48$2 = { class: "cap-name" };
const _hoisted_49$2 = { class: "cap-count-badge" };
const _hoisted_50$2 = { class: "cap-desc" };
const _hoisted_51$2 = { class: "obs-filter-strip" };
const _hoisted_52$2 = { class: "filter-main-bar" };
const _hoisted_53$1 = { class: "filter-search-box" };
const _hoisted_54$1 = { class: "filter-type-group" };
const _hoisted_55$1 = ["onClick"];
const _hoisted_56$1 = {
  key: 0,
  class: "active-filter-tags"
};
const _hoisted_57$1 = {
  key: 0,
  class: "filter-tag-item"
};
const _hoisted_58$1 = {
  key: 1,
  class: "filter-tag-item"
};
const _hoisted_59$1 = {
  key: 2,
  class: "filter-tag-item"
};
const _hoisted_60$1 = {
  key: 3,
  class: "filter-tag-item"
};
const _hoisted_61$1 = { class: "obs-dual-container" };
const _hoisted_62$1 = { class: "obs-stream-column" };
const _hoisted_63$1 = { class: "stream-header-bar" };
const _hoisted_64$1 = { class: "stream-tabs-switch" };
const _hoisted_65$1 = { class: "stream-count-badge lead-badge" };
const _hoisted_66$1 = { class: "stream-count-badge" };
const _hoisted_67$1 = { class: "stream-hint" };
const _hoisted_68$1 = { class: "leads-category-strip" };
const _hoisted_69$1 = ["onClick"];
const _hoisted_70$1 = { class: "leads-month-strip" };
const _hoisted_71$1 = ["onClick"];
const _hoisted_72$1 = {
  key: 0,
  class: "stream-loading-state"
};
const _hoisted_73$1 = {
  key: 1,
  class: "stream-empty-state"
};
const _hoisted_74$1 = {
  key: 2,
  class: "official-leads-column"
};
const _hoisted_75$1 = { class: "lead-head" };
const _hoisted_76$1 = { class: "lead-vendor-info" };
const _hoisted_77$1 = { class: "lead-vendor-name" };
const _hoisted_78$1 = {
  key: 0,
  class: "lead-cat-badge"
};
const _hoisted_79$1 = { class: "lead-badges" };
const _hoisted_80$1 = {
  key: 0,
  class: "lead-tag candidate"
};
const _hoisted_81$1 = { class: "lead-title" };
const _hoisted_82$1 = ["href"];
const _hoisted_83$1 = { class: "lead-meta" };
const _hoisted_84$1 = { class: "meta-item" };
const _hoisted_85$1 = ["href"];
const _hoisted_86$1 = {
  key: 0,
  class: "stream-pagination"
};
const _hoisted_87$1 = ["disabled"];
const _hoisted_88$1 = { class: "pg-info" };
const _hoisted_89$1 = ["disabled"];
const _hoisted_90$1 = {
  key: 0,
  class: "stream-loading-state"
};
const _hoisted_91$1 = {
  key: 1,
  class: "stream-empty-state"
};
const _hoisted_92$1 = {
  key: 2,
  class: "timeline-group-list"
};
const _hoisted_93$1 = { class: "group-date-anchor" };
const _hoisted_94$1 = { class: "anchor-date-str" };
const _hoisted_95$1 = { class: "group-cards-column" };
const _hoisted_96$1 = ["onClick"];
const _hoisted_97$1 = { class: "item-head" };
const _hoisted_98$1 = { class: "item-vendor-box" };
const _hoisted_99$1 = { class: "vendor-txt" };
const _hoisted_100$1 = { class: "item-model-title" };
const _hoisted_101 = { class: "item-summary" };
const _hoisted_102 = { class: "item-footer" };
const _hoisted_103 = { class: "item-modalities" };
const _hoisted_104 = ["href"];
const _hoisted_105 = {
  key: 3,
  class: "stream-pagination"
};
const _hoisted_106 = ["disabled"];
const _hoisted_107 = { class: "pg-info" };
const _hoisted_108 = ["disabled"];
const _hoisted_109 = { class: "obs-sidebar-column" };
const _hoisted_110 = { class: "sidebar-block observatory-stat-card" };
const _hoisted_111 = { class: "stat-mini-grid" };
const _hoisted_112 = { class: "stat-mini-item" };
const _hoisted_113 = { class: "stat-mini-num" };
const _hoisted_114 = { class: "stat-mini-item" };
const _hoisted_115 = { class: "stat-mini-num" };
const _hoisted_116 = { class: "stat-mini-item highlight" };
const _hoisted_117 = { class: "stat-mini-num" };
const _hoisted_118 = { class: "stat-mini-item" };
const _hoisted_119 = { class: "stat-mini-num" };
const _hoisted_120 = { class: "stat-footer-bar" };
const _hoisted_121 = { class: "sidebar-block recent-vendors-block" };
const _hoisted_122 = { class: "sidebar-block-head" };
const _hoisted_123 = { class: "active-vendor-list" };
const _hoisted_124 = ["onClick"];
const _hoisted_125 = { class: "vendor-left-meta" };
const _hoisted_126 = { class: "v-name" };
const _hoisted_127 = { class: "vendor-right-stats" };
const _hoisted_128 = { class: "v-date" };
const _hoisted_129 = { class: "v-badge" };
const _hoisted_130 = { class: "sidebar-block timeline-portal-card" };
const _sfc_main$g = {
  __name: "AiHomeView",
  setup(__props) {
    const router2 = useRouter();
    const route = useRoute();
    const events = /* @__PURE__ */ ref([]);
    const total = /* @__PURE__ */ ref(0);
    const page = /* @__PURE__ */ ref(1);
    const size = /* @__PURE__ */ ref(10);
    const totalPages = /* @__PURE__ */ ref(1);
    const loading = /* @__PURE__ */ ref(true);
    const vendors = /* @__PURE__ */ ref([]);
    const status = /* @__PURE__ */ ref(null);
    const keyword = /* @__PURE__ */ ref(route.query.keyword || "");
    const selectedVendor = /* @__PURE__ */ ref(route.query.vendor || "");
    const selectedModality = /* @__PURE__ */ ref(route.query.modality || "");
    const selectedType = /* @__PURE__ */ ref(route.query.type || "");
    const eventTypes = [
      { key: "", label: "全部事件" },
      { key: "WEIGHTS_RELEASE", label: "权重开源" },
      { key: "MODEL_RELEASE", label: "首代发布" },
      { key: "VERSION_UPDATE", label: "版本升级" },
      { key: "API_AVAILABLE", label: "API 开放" }
    ];
    const capabilityList = computed(() => {
      var _a;
      const counts = ((_a = status.value) == null ? void 0 : _a.capabilityCounts) || {};
      return [
        {
          id: "textReasoning",
          name: "文本与推理",
          en: "Text & Reasoning",
          icon: "🧠",
          modality: "文本",
          count: counts.textReasoning || 12,
          desc: "长上下文逻辑推导、数学证明与深度推理模型"
        },
        {
          id: "code",
          name: "代码智能",
          en: "Code & Engineering",
          icon: "⚡",
          modality: "代码",
          count: counts.code || 8,
          desc: "专精代码生成、补全、Debug 与全栈软件工程"
        },
        {
          id: "vision",
          name: "视觉与多模态",
          en: "Vision & Multimodal",
          icon: "👁️",
          modality: "视觉",
          count: counts.vision || 5,
          desc: "图文问答、视觉感知与原生跨模态输入输出"
        },
        {
          id: "audio",
          name: "语音与实时交互",
          en: "Speech & Real-time",
          icon: "🎙️",
          modality: "语音",
          count: counts.audio || 2,
          desc: "全双工低延时语音交互与端到端音频生成"
        }
      ];
    });
    const heroMajorEvent = computed(() => {
      return events.value.length > 0 ? events.value[0] : null;
    });
    const heroSecondaryEvents = computed(() => {
      return events.value.length > 1 ? events.value.slice(1, 3) : [];
    });
    const streamEvents = computed(() => {
      return events.value;
    });
    const groupedStreamEvents = computed(() => {
      const groups = [];
      const map = /* @__PURE__ */ new Map();
      streamEvents.value.forEach((event) => {
        const rawDate = event.releaseDate || event.firstSeenAt;
        const dateKey = rawDate ? rawDate.substring(0, 10) : "近期发布";
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
          groups.push({ date: dateKey, events: map.get(dateKey) });
        }
        map.get(dateKey).push(event);
      });
      return groups;
    });
    const recentActiveVendors = computed(() => {
      var _a;
      return ((_a = status.value) == null ? void 0 : _a.recentActiveVendors) || [];
    });
    function isRecentRelease(dateStr) {
      if (!dateStr) return false;
      const releaseTime = new Date(dateStr).getTime();
      const now = (/* @__PURE__ */ new Date()).getTime();
      const diffDays = (now - releaseTime) / (1e3 * 3600 * 24);
      return diffDays <= 30;
    }
    async function loadStatusAndVendors() {
      try {
        const [statusRes, vendorsRes] = await Promise.all([
          aiApi.getStatus().catch(() => null),
          aiApi.getVendors().catch(() => [])
        ]);
        status.value = statusRes;
        vendors.value = vendorsRes || [];
      } catch (e) {
        console.error("加载元数据异常", e);
      }
    }
    async function loadEvents() {
      loading.value = true;
      try {
        const res = await aiApi.getEvents({
          keyword: keyword.value,
          vendor: selectedVendor.value,
          modality: selectedModality.value,
          type: selectedType.value,
          page: page.value,
          size: size.value
        });
        events.value = res.list || [];
        total.value = res.total || 0;
        totalPages.value = res.totalPages || 1;
      } catch (e) {
        console.error("加载事件流失败", e);
      } finally {
        loading.value = false;
      }
    }
    const activeStreamView = /* @__PURE__ */ ref("official_leads");
    const officialUpdates = /* @__PURE__ */ ref([]);
    const officialUpdatesTotal = /* @__PURE__ */ ref(0);
    const officialUpdatesLoading = /* @__PURE__ */ ref(false);
    const selectedLeadMonth = /* @__PURE__ */ ref("");
    const selectedLeadCategory = /* @__PURE__ */ ref("");
    const leadPage = /* @__PURE__ */ ref(1);
    const leadPageSize = /* @__PURE__ */ ref(15);
    const leadCategories = [
      { key: "", label: "全部主题" },
      { key: "MODEL_RELEASE", label: "🚀 模型首发/更新" },
      { key: "PRODUCT_FEATURE", label: "✨ 产品功能" },
      { key: "API_PRICING", label: "💳 API与定价" },
      { key: "OPEN_SOURCE", label: "🌐 开源生态" },
      { key: "DEV_TOOLS", label: "🛠️ 开发者工具" },
      { key: "GENERAL_NEWS", label: "📢 官方公告" }
    ];
    async function loadOfficialUpdates() {
      officialUpdatesLoading.value = true;
      try {
        let vendorIdParam = null;
        if (selectedVendor.value && vendors.value.length > 0) {
          const matchV = vendors.value.find((v) => v.slug === selectedVendor.value || v.name === selectedVendor.value);
          if (matchV) vendorIdParam = matchV.id;
        }
        const res = await aiApi.getOfficialUpdates({
          month: selectedLeadMonth.value,
          vendorId: vendorIdParam,
          category: selectedLeadCategory.value,
          keyword: keyword.value,
          page: leadPage.value,
          size: leadPageSize.value
        });
        officialUpdates.value = res.list || [];
        officialUpdatesTotal.value = res.total || 0;
      } catch (e) {
        console.error("加载官方动态失败", e);
      } finally {
        officialUpdatesLoading.value = false;
      }
    }
    function switchStreamView(view) {
      activeStreamView.value = view;
      if (view === "official_leads") {
        loadOfficialUpdates();
      } else if (view === "confirmed" && events.value.length === 0) {
        loadEvents();
      }
    }
    function filterLeadCategory(cat) {
      selectedLeadCategory.value = cat;
      leadPage.value = 1;
      loadOfficialUpdates();
    }
    function filterLeadMonth(m) {
      selectedLeadMonth.value = selectedLeadMonth.value === m ? "" : m;
      leadPage.value = 1;
      loadOfficialUpdates();
    }
    function applyFilter() {
      page.value = 1;
      leadPage.value = 1;
      syncUrl();
      loadEvents();
      loadOfficialUpdates();
    }
    function selectModality(mod) {
      selectedModality.value = selectedModality.value === mod ? "" : mod;
      applyFilter();
      const el = document.getElementById("event-stream-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    function selectVendor(v) {
      selectedVendor.value = selectedVendor.value === v ? "" : v;
      applyFilter();
    }
    function selectType(t) {
      selectedType.value = selectedType.value === t ? "" : t;
      applyFilter();
    }
    function resetFilters() {
      keyword.value = "";
      selectedVendor.value = "";
      selectedModality.value = "";
      selectedType.value = "";
      selectedLeadMonth.value = "";
      selectedLeadCategory.value = "";
      applyFilter();
    }
    function syncUrl() {
      const query = {};
      if (keyword.value) query.keyword = keyword.value;
      if (selectedVendor.value) query.vendor = selectedVendor.value;
      if (selectedModality.value) query.modality = selectedModality.value;
      if (selectedType.value) query.type = selectedType.value;
      router2.replace({ query });
    }
    function parseModalities(modStr) {
      if (!modStr) return [];
      return modStr.split(",").map((s) => s.trim()).filter(Boolean);
    }
    function formatDate(dateStr) {
      if (!dateStr) return "-";
      return dateStr.substring(0, 10);
    }
    function getEventTypeBadge(type) {
      const map = {
        WEIGHTS_RELEASE: { text: "权重开源", color: "#E8B96E", bg: "rgba(232, 185, 110, 0.15)" },
        MODEL_RELEASE: { text: "首代发布", color: "#087D82", bg: "rgba(8, 125, 130, 0.15)" },
        VERSION_UPDATE: { text: "版本升级", color: "#76D4CE", bg: "rgba(118, 212, 206, 0.15)" },
        API_AVAILABLE: { text: "API 开放", color: "#EA735C", bg: "rgba(234, 115, 92, 0.15)" }
      };
      return map[type] || { text: "动态发布", color: "#829aa4", bg: "rgba(130, 154, 164, 0.15)" };
    }
    onMounted(() => {
      loadStatusAndVendors();
      loadEvents();
      loadOfficialUpdates();
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$g, [
        createBaseVNode("section", _hoisted_2$g, [
          _cache[18] || (_cache[18] = createStaticVNode('<svg class="canvas-orbit-bg" viewBox="0 0 1200 480" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" data-v-f8c1fee9><path d="M-100 240 C 300 80, 800 400, 1300 200" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="6 6" data-v-f8c1fee9></path><path d="M-100 340 C 400 120, 900 450, 1300 280" stroke="rgba(255,255,255,0.04)" stroke-width="1" data-v-f8c1fee9></path><circle cx="850" cy="180" r="160" stroke="rgba(118, 212, 206, 0.05)" stroke-width="1" data-v-f8c1fee9></circle><circle cx="850" cy="180" r="280" stroke="rgba(118, 212, 206, 0.03)" stroke-width="1" data-v-f8c1fee9></circle></svg>', 1)),
          createBaseVNode("div", _hoisted_3$g, [
            createBaseVNode("div", _hoisted_4$g, [
              _cache[14] || (_cache[14] = createStaticVNode('<div class="obs-terminal-badge" data-v-f8c1fee9><span class="station-mark" data-v-f8c1fee9></span><span class="station-code" data-v-f8c1fee9>AI MODEL OBSERVATORY // 全球模型动态观察台</span></div><h1 class="obs-main-title" data-v-f8c1fee9>全球大模型<br data-v-f8c1fee9>发布演进动态</h1><p class="obs-mission-desc" data-v-f8c1fee9> 收录全球权威 AI 厂商官方发布渠道，第一时间沉淀模型发布、架构演进、开源权重与真实官方存证凭据。 </p>', 3)),
              createBaseVNode("div", _hoisted_5$g, [
                createVNode(_component_router_link, {
                  to: "/models",
                  class: "obs-link-btn primary"
                }, {
                  default: withCtx(() => {
                    var _a2;
                    return [
                      createTextVNode(" 浏览模型目录 (" + toDisplayString(((_a2 = status.value) == null ? void 0 : _a2.totalModels) || 12) + ") → ", 1)
                    ];
                  }),
                  _: 1
                }),
                createVNode(_component_router_link, {
                  to: "/model-timeline",
                  class: "obs-link-btn secondary"
                }, {
                  default: withCtx(() => [..._cache[13] || (_cache[13] = [
                    createTextVNode(" 演进时间线 ", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            heroMajorEvent.value ? (openBlock(), createElementBlock("div", _hoisted_6$f, [
              createBaseVNode("div", {
                class: "focus-card-wrapper",
                onClick: _cache[1] || (_cache[1] = ($event) => unref(router2).push(`/models/${heroMajorEvent.value.modelId}`))
              }, [
                createBaseVNode("div", _hoisted_7$f, [
                  createBaseVNode("div", _hoisted_8$f, [
                    createBaseVNode("span", {
                      class: "vendor-dot",
                      style: normalizeStyle({ backgroundColor: heroMajorEvent.value.brandColor || "#76D4CE" })
                    }, null, 4),
                    createBaseVNode("span", _hoisted_9$f, toDisplayString(heroMajorEvent.value.vendorName), 1)
                  ]),
                  createBaseVNode("div", _hoisted_10$f, [
                    _cache[15] || (_cache[15] = createBaseVNode("span", { class: "date-icon" }, "📅", -1)),
                    createBaseVNode("span", _hoisted_11$e, toDisplayString(formatDate(heroMajorEvent.value.releaseDate || heroMajorEvent.value.firstSeenAt)), 1),
                    createBaseVNode("span", _hoisted_12$e, toDisplayString(isRecentRelease(heroMajorEvent.value.releaseDate) ? "近期重磅" : "最近确认发布"), 1)
                  ])
                ]),
                createBaseVNode("h2", _hoisted_13$d, toDisplayString(heroMajorEvent.value.modelName), 1),
                createBaseVNode("p", _hoisted_14$d, toDisplayString(heroMajorEvent.value.summary), 1),
                createBaseVNode("div", _hoisted_15$d, [
                  createBaseVNode("div", _hoisted_16$c, [
                    createBaseVNode("span", {
                      class: "event-type-tag",
                      style: normalizeStyle({
                        color: getEventTypeBadge(heroMajorEvent.value.eventType).color,
                        backgroundColor: getEventTypeBadge(heroMajorEvent.value.eventType).bg
                      })
                    }, toDisplayString(getEventTypeBadge(heroMajorEvent.value.eventType).text), 5),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(parseModalities(heroMajorEvent.value.modalities), (m) => {
                      return openBlock(), createElementBlock("span", {
                        key: m,
                        class: "mod-pill"
                      }, " #" + toDisplayString(m), 1);
                    }), 128))
                  ]),
                  heroMajorEvent.value.evidences && heroMajorEvent.value.evidences.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_17$c, [
                    createBaseVNode("a", {
                      href: heroMajorEvent.value.evidences[0].officialUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: "official-source-anchor",
                      onClick: _cache[0] || (_cache[0] = withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      _cache[16] || (_cache[16] = createBaseVNode("span", null, "🔗", -1)),
                      createBaseVNode("span", _hoisted_19$c, toDisplayString(heroMajorEvent.value.evidences[0].title || "官方发布原文"), 1),
                      _cache[17] || (_cache[17] = createBaseVNode("span", { class: "arrow" }, "↗", -1))
                    ], 8, _hoisted_18$c)
                  ])) : createCommentVNode("", true)
                ])
              ])
            ])) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("div", _hoisted_20$c, [
          createBaseVNode("div", _hoisted_21$c, [
            _cache[19] || (_cache[19] = createBaseVNode("span", { class: "strip-label" }, "收录厂商", -1)),
            createBaseVNode("span", _hoisted_22$c, toDisplayString(((_a = status.value) == null ? void 0 : _a.totalVendors) || 20), 1)
          ]),
          _cache[24] || (_cache[24] = createBaseVNode("div", { class: "strip-divider" }, "·", -1)),
          createBaseVNode("div", _hoisted_23$c, [
            _cache[20] || (_cache[20] = createBaseVNode("span", { class: "strip-label" }, "启用官方来源", -1)),
            createBaseVNode("span", _hoisted_24$b, toDisplayString(((_b = status.value) == null ? void 0 : _b.activeSources) || 8), 1)
          ]),
          _cache[25] || (_cache[25] = createBaseVNode("div", { class: "strip-divider" }, "·", -1)),
          createBaseVNode("div", _hoisted_25$b, [
            _cache[21] || (_cache[21] = createBaseVNode("span", { class: "strip-label" }, "已核实发布", -1)),
            createBaseVNode("span", _hoisted_26$a, toDisplayString(((_c = status.value) == null ? void 0 : _c.totalEvents) || total.value), 1)
          ]),
          _cache[26] || (_cache[26] = createBaseVNode("div", { class: "strip-divider" }, "·", -1)),
          createBaseVNode("div", _hoisted_27$8, [
            _cache[22] || (_cache[22] = createBaseVNode("span", { class: "strip-label" }, "最近确认发布", -1)),
            createBaseVNode("span", _hoisted_28$8, toDisplayString(((_d = status.value) == null ? void 0 : _d.latestConfirmedRelease) || "2026-03-16"), 1)
          ]),
          _cache[27] || (_cache[27] = createBaseVNode("div", { class: "strip-divider" }, "·", -1)),
          createBaseVNode("div", _hoisted_29$8, [
            _cache[23] || (_cache[23] = createBaseVNode("span", { class: "strip-label" }, "最近成功检查", -1)),
            createBaseVNode("span", _hoisted_30$8, toDisplayString(((_e = status.value) == null ? void 0 : _e.lastCheckTime) || "尚未检查"), 1)
          ])
        ]),
        heroSecondaryEvents.value.length > 0 ? (openBlock(), createElementBlock("section", _hoisted_31$7, [
          _cache[28] || (_cache[28] = createBaseVNode("div", { class: "section-title-row" }, [
            createBaseVNode("h3", { class: "section-caption" }, "重点动态精选"),
            createBaseVNode("span", { class: "section-subnote" }, "官方来源近期已确认发布的次级关键模型")
          ], -1)),
          createBaseVNode("div", _hoisted_32$6, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(heroSecondaryEvents.value, (sec, idx) => {
              return openBlock(), createElementBlock("article", {
                key: sec.id,
                class: normalizeClass(["secondary-event-card", idx === 0 ? "palette-cream" : "palette-teal"]),
                onClick: ($event) => unref(router2).push(`/models/${sec.modelId}`)
              }, [
                createBaseVNode("div", _hoisted_34$4, [
                  createBaseVNode("div", _hoisted_35$4, [
                    createBaseVNode("span", {
                      class: "sec-dot",
                      style: normalizeStyle({ backgroundColor: sec.brandColor || "var(--obs-primary)" })
                    }, null, 4),
                    createBaseVNode("span", _hoisted_36$4, toDisplayString(sec.vendorName), 1)
                  ]),
                  createBaseVNode("div", _hoisted_37$4, toDisplayString(formatDate(sec.releaseDate || sec.firstSeenAt)), 1)
                ]),
                createBaseVNode("h4", _hoisted_38$4, toDisplayString(sec.modelName), 1),
                createBaseVNode("p", _hoisted_39$4, toDisplayString(sec.summary), 1),
                createBaseVNode("div", _hoisted_40$4, [
                  createBaseVNode("span", {
                    class: "event-type-tag mini",
                    style: normalizeStyle({
                      color: getEventTypeBadge(sec.eventType).color,
                      backgroundColor: getEventTypeBadge(sec.eventType).bg
                    })
                  }, toDisplayString(getEventTypeBadge(sec.eventType).text), 5),
                  sec.evidences && sec.evidences.length > 0 ? (openBlock(), createElementBlock("a", {
                    key: 0,
                    href: sec.evidences[0].officialUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "sec-evidence-link",
                    onClick: _cache[2] || (_cache[2] = withModifiers(() => {
                    }, ["stop"]))
                  }, " 凭据 ↗ ", 8, _hoisted_41$4)) : createCommentVNode("", true)
                ])
              ], 10, _hoisted_33$4);
            }), 128))
          ])
        ])) : createCommentVNode("", true),
        createBaseVNode("section", _hoisted_42$4, [
          _cache[29] || (_cache[29] = createBaseVNode("div", { class: "section-title-row" }, [
            createBaseVNode("h3", { class: "section-caption" }, "按核心能力探索"),
            createBaseVNode("span", { class: "section-subnote" }, "基于真实架构能力分类筛选收录模型")
          ], -1)),
          createBaseVNode("div", _hoisted_43$3, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(capabilityList.value, (cap) => {
              return openBlock(), createElementBlock("div", {
                key: cap.id,
                class: normalizeClass(["capability-card", { active: selectedModality.value === cap.modality }]),
                onClick: ($event) => selectModality(cap.modality)
              }, [
                createBaseVNode("div", _hoisted_45$3, toDisplayString(cap.icon), 1),
                createBaseVNode("div", _hoisted_46$3, [
                  createBaseVNode("div", _hoisted_47$2, [
                    createBaseVNode("span", _hoisted_48$2, toDisplayString(cap.name), 1),
                    createBaseVNode("span", _hoisted_49$2, toDisplayString(cap.count) + " 款模型", 1)
                  ]),
                  createBaseVNode("p", _hoisted_50$2, toDisplayString(cap.desc), 1)
                ])
              ], 10, _hoisted_44$3);
            }), 128))
          ])
        ]),
        _cache[58] || (_cache[58] = createBaseVNode("div", { id: "event-stream-anchor" }, null, -1)),
        createBaseVNode("section", _hoisted_51$2, [
          createBaseVNode("div", _hoisted_52$2, [
            createBaseVNode("div", _hoisted_53$1, [
              _cache[30] || (_cache[30] = createBaseVNode("span", { class: "search-ico" }, "🔍", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => keyword.value = $event),
                type: "text",
                placeholder: "搜索模型名、厂商、架构或代际...",
                class: "search-input",
                onKeyup: withKeys(applyFilter, ["enter"])
              }, null, 544), [
                [vModelText, keyword.value]
              ]),
              keyword.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "clear-input-btn",
                onClick: _cache[4] || (_cache[4] = ($event) => {
                  keyword.value = "";
                  applyFilter();
                })
              }, "✕")) : createCommentVNode("", true)
            ]),
            createBaseVNode("div", _hoisted_54$1, [
              (openBlock(), createElementBlock(Fragment, null, renderList(eventTypes, (t) => {
                return createBaseVNode("button", {
                  key: t.key,
                  class: normalizeClass(["type-filter-chip", { active: selectedType.value === t.key }]),
                  onClick: ($event) => selectType(t.key)
                }, toDisplayString(t.label), 11, _hoisted_55$1);
              }), 64))
            ])
          ]),
          keyword.value || selectedVendor.value || selectedModality.value || selectedType.value ? (openBlock(), createElementBlock("div", _hoisted_56$1, [
            _cache[31] || (_cache[31] = createBaseVNode("span", { class: "active-label" }, "已筛选：", -1)),
            keyword.value ? (openBlock(), createElementBlock("span", _hoisted_57$1, "关键词: " + toDisplayString(keyword.value), 1)) : createCommentVNode("", true),
            selectedVendor.value ? (openBlock(), createElementBlock("span", _hoisted_58$1, "厂商: " + toDisplayString(selectedVendor.value), 1)) : createCommentVNode("", true),
            selectedModality.value ? (openBlock(), createElementBlock("span", _hoisted_59$1, "能力: " + toDisplayString(selectedModality.value), 1)) : createCommentVNode("", true),
            selectedType.value ? (openBlock(), createElementBlock("span", _hoisted_60$1, "事件: " + toDisplayString(getEventTypeBadge(selectedType.value).text), 1)) : createCommentVNode("", true),
            createBaseVNode("button", {
              class: "reset-all-btn",
              onClick: resetFilters
            }, "清除全部筛选 ✕")
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_61$1, [
          createBaseVNode("main", _hoisted_62$1, [
            createBaseVNode("div", _hoisted_63$1, [
              createBaseVNode("div", _hoisted_64$1, [
                createBaseVNode("button", {
                  class: normalizeClass(["stream-tab-btn highlight-tab", { active: activeStreamView.value === "official_leads" }]),
                  onClick: _cache[5] || (_cache[5] = ($event) => switchStreamView("official_leads"))
                }, [
                  _cache[32] || (_cache[32] = createTextVNode(" 📡 官方动态主信息流 ", -1)),
                  createBaseVNode("span", _hoisted_65$1, toDisplayString(officialUpdatesTotal.value), 1)
                ], 2),
                createBaseVNode("button", {
                  class: normalizeClass(["stream-tab-btn", { active: activeStreamView.value === "confirmed" }]),
                  onClick: _cache[6] || (_cache[6] = ($event) => switchStreamView("confirmed"))
                }, [
                  _cache[33] || (_cache[33] = createTextVNode(" 🛡️ 已核实模型发布 ", -1)),
                  createBaseVNode("span", _hoisted_66$1, toDisplayString(total.value), 1)
                ], 2)
              ]),
              createBaseVNode("span", _hoisted_67$1, toDisplayString(activeStreamView.value === "official_leads" ? "直连全球权威原厂发布渠道实时捕获；完整涵盖模型、产品功能、API与开源动态" : "经人工多方核验模型版本、发布日期与官方存证的结构化事实时间轴"), 1)
            ]),
            activeStreamView.value === "official_leads" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createBaseVNode("div", _hoisted_68$1, [
                _cache[34] || (_cache[34] = createBaseVNode("span", { class: "strip-label" }, "主题分类：", -1)),
                (openBlock(), createElementBlock(Fragment, null, renderList(leadCategories, (cat) => {
                  return createBaseVNode("button", {
                    key: cat.key,
                    class: normalizeClass(["lead-category-pill", { active: selectedLeadCategory.value === cat.key }]),
                    onClick: ($event) => filterLeadCategory(cat.key)
                  }, toDisplayString(cat.label), 11, _hoisted_69$1);
                }), 64))
              ]),
              createBaseVNode("div", _hoisted_70$1, [
                _cache[35] || (_cache[35] = createBaseVNode("span", { class: "strip-label" }, "月份观测：", -1)),
                createBaseVNode("button", {
                  class: normalizeClass(["lead-month-pill", { active: selectedLeadMonth.value === "" }]),
                  onClick: _cache[7] || (_cache[7] = ($event) => filterLeadMonth(""))
                }, " 全部月份 ", 2),
                (openBlock(), createElementBlock(Fragment, null, renderList(["2026-09", "2026-08", "2026-07", "2026-06", "2026-05", "2026-04", "2026-03", "2026-02", "2026-01"], (m) => {
                  return createBaseVNode("button", {
                    key: m,
                    class: normalizeClass(["lead-month-pill", { active: selectedLeadMonth.value === m }]),
                    onClick: ($event) => filterLeadMonth(m)
                  }, toDisplayString(m), 11, _hoisted_71$1);
                }), 64))
              ]),
              officialUpdatesLoading.value ? (openBlock(), createElementBlock("div", _hoisted_72$1, [..._cache[36] || (_cache[36] = [
                createBaseVNode("div", { class: "loading-spinner-bar" }, null, -1),
                createBaseVNode("span", { class: "loading-tip" }, "正在同步已订阅官方渠道的最新捕获条目...", -1)
              ])])) : officialUpdates.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_73$1, [
                _cache[37] || (_cache[37] = createBaseVNode("div", { class: "empty-icon" }, "📡", -1)),
                _cache[38] || (_cache[38] = createBaseVNode("p", { class: "empty-title" }, "未找到匹配的官方原厂动态条目", -1)),
                createBaseVNode("button", {
                  class: "empty-reset-btn",
                  onClick: resetFilters
                }, "重置全部筛选条件")
              ])) : (openBlock(), createElementBlock("div", _hoisted_74$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(officialUpdates.value, (lead) => {
                  return openBlock(), createElementBlock("article", {
                    key: lead.id,
                    class: "lead-update-card"
                  }, [
                    createBaseVNode("div", _hoisted_75$1, [
                      createBaseVNode("div", _hoisted_76$1, [
                        createBaseVNode("span", {
                          class: "vendor-dot-sm",
                          style: normalizeStyle({ backgroundColor: lead.brandColor || "#087D82" })
                        }, null, 4),
                        createBaseVNode("span", _hoisted_77$1, toDisplayString(lead.vendorName), 1),
                        lead.categoryName ? (openBlock(), createElementBlock("span", _hoisted_78$1, toDisplayString(lead.categoryName), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("div", _hoisted_79$1, [
                        lead.candidateGenerated ? (openBlock(), createElementBlock("span", _hoisted_80$1, "已提取模型事实候选")) : createCommentVNode("", true),
                        _cache[39] || (_cache[39] = createBaseVNode("span", { class: "lead-status-pill" }, "官方原厂动态", -1))
                      ])
                    ]),
                    createBaseVNode("h4", _hoisted_81$1, [
                      createBaseVNode("a", {
                        href: lead.canonicalUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "lead-title-link"
                      }, toDisplayString(lead.title) + " ↗ ", 9, _hoisted_82$1)
                    ]),
                    createBaseVNode("div", _hoisted_83$1, [
                      createBaseVNode("span", {
                        class: normalizeClass(["meta-item", { "date-unverified": !lead.publishedAt }])
                      }, " 📅 " + toDisplayString(lead.publishedAt ? `官方发布: ${lead.publishedAt}` : "日期待核实"), 3),
                      _cache[40] || (_cache[40] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                      createBaseVNode("span", _hoisted_84$1, " ⏱️ 首次发现: " + toDisplayString(lead.firstSeenAt || "-"), 1),
                      _cache[41] || (_cache[41] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                      createBaseVNode("a", {
                        href: lead.canonicalUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "lead-source-direct"
                      }, " 查看官方原文 ↗ ", 8, _hoisted_85$1)
                    ])
                  ]);
                }), 128)),
                officialUpdatesTotal.value > leadPageSize.value ? (openBlock(), createElementBlock("div", _hoisted_86$1, [
                  createBaseVNode("button", {
                    class: "pg-btn",
                    disabled: leadPage.value <= 1,
                    onClick: _cache[8] || (_cache[8] = ($event) => {
                      leadPage.value--;
                      loadOfficialUpdates();
                    })
                  }, " ← 上一页 ", 8, _hoisted_87$1),
                  createBaseVNode("span", _hoisted_88$1, "第 " + toDisplayString(leadPage.value) + " 页 / 共 " + toDisplayString(Math.ceil(officialUpdatesTotal.value / leadPageSize.value)) + " 页 (" + toDisplayString(officialUpdatesTotal.value) + " 条)", 1),
                  createBaseVNode("button", {
                    class: "pg-btn",
                    disabled: leadPage.value * leadPageSize.value >= officialUpdatesTotal.value,
                    onClick: _cache[9] || (_cache[9] = ($event) => {
                      leadPage.value++;
                      loadOfficialUpdates();
                    })
                  }, " 下一页 → ", 8, _hoisted_89$1)
                ])) : createCommentVNode("", true)
              ]))
            ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              loading.value ? (openBlock(), createElementBlock("div", _hoisted_90$1, [..._cache[42] || (_cache[42] = [
                createBaseVNode("div", { class: "loading-spinner-bar" }, null, -1),
                createBaseVNode("span", { class: "loading-tip" }, "正在同步已审计的官方动态...", -1)
              ])])) : groupedStreamEvents.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_91$1, [
                _cache[43] || (_cache[43] = createBaseVNode("div", { class: "empty-icon" }, "📭", -1)),
                _cache[44] || (_cache[44] = createBaseVNode("p", { class: "empty-title" }, "未找到匹配的已确认发布记录", -1)),
                createBaseVNode("button", {
                  class: "empty-reset-btn",
                  onClick: resetFilters
                }, "重置全部筛选条件")
              ])) : (openBlock(), createElementBlock("div", _hoisted_92$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(groupedStreamEvents.value, (group) => {
                  return openBlock(), createElementBlock("div", {
                    key: group.date,
                    class: "timeline-date-group"
                  }, [
                    createBaseVNode("div", _hoisted_93$1, [
                      _cache[45] || (_cache[45] = createBaseVNode("span", { class: "anchor-bullet" }, null, -1)),
                      createBaseVNode("span", _hoisted_94$1, toDisplayString(group.date), 1)
                    ]),
                    createBaseVNode("div", _hoisted_95$1, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(group.events, (item) => {
                        return openBlock(), createElementBlock("article", {
                          key: item.id,
                          class: "timeline-event-card",
                          onClick: ($event) => unref(router2).push(`/models/${item.modelId}`)
                        }, [
                          createBaseVNode("div", _hoisted_97$1, [
                            createBaseVNode("div", _hoisted_98$1, [
                              createBaseVNode("span", {
                                class: "vendor-dot-sm",
                                style: normalizeStyle({ backgroundColor: item.brandColor || "var(--obs-primary)" })
                              }, null, 4),
                              createBaseVNode("span", _hoisted_99$1, toDisplayString(item.vendorName), 1)
                            ]),
                            createBaseVNode("span", {
                              class: "event-type-tag sm",
                              style: normalizeStyle({
                                color: getEventTypeBadge(item.eventType).color,
                                backgroundColor: getEventTypeBadge(item.eventType).bg
                              })
                            }, toDisplayString(getEventTypeBadge(item.eventType).text), 5)
                          ]),
                          createBaseVNode("h4", _hoisted_100$1, toDisplayString(item.modelName), 1),
                          createBaseVNode("p", _hoisted_101, toDisplayString(item.summary), 1),
                          createBaseVNode("div", _hoisted_102, [
                            createBaseVNode("div", _hoisted_103, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(parseModalities(item.modalities), (m) => {
                                return openBlock(), createElementBlock("span", {
                                  key: m,
                                  class: "mini-mod-tag"
                                }, " #" + toDisplayString(m), 1);
                              }), 128))
                            ]),
                            item.evidences && item.evidences.length > 0 ? (openBlock(), createElementBlock("a", {
                              key: 0,
                              href: item.evidences[0].officialUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              class: "official-proof-link",
                              onClick: _cache[10] || (_cache[10] = withModifiers(() => {
                              }, ["stop"]))
                            }, [
                              createBaseVNode("span", null, "🔗 " + toDisplayString(item.evidences[0].title || "官方凭据") + " ↗", 1)
                            ], 8, _hoisted_104)) : createCommentVNode("", true)
                          ])
                        ], 8, _hoisted_96$1);
                      }), 128))
                    ])
                  ]);
                }), 128))
              ])),
              totalPages.value > 1 ? (openBlock(), createElementBlock("div", _hoisted_105, [
                createBaseVNode("button", {
                  class: "pg-btn",
                  disabled: page.value <= 1,
                  onClick: _cache[11] || (_cache[11] = ($event) => {
                    page.value--;
                    loadEvents();
                  })
                }, " ← 上一页 ", 8, _hoisted_106),
                createBaseVNode("span", _hoisted_107, "第 " + toDisplayString(page.value) + " / " + toDisplayString(totalPages.value) + " 页", 1),
                createBaseVNode("button", {
                  class: "pg-btn",
                  disabled: page.value >= totalPages.value,
                  onClick: _cache[12] || (_cache[12] = ($event) => {
                    page.value++;
                    loadEvents();
                  })
                }, " 下一页 → ", 8, _hoisted_108)
              ])) : createCommentVNode("", true)
            ], 64))
          ]),
          createBaseVNode("aside", _hoisted_109, [
            createBaseVNode("div", _hoisted_110, [
              _cache[50] || (_cache[50] = createStaticVNode('<div class="sidebar-block-head" data-v-f8c1fee9><h4 class="sidebar-block-title" data-v-f8c1fee9>📡 采录运行指标</h4><span class="live-pill" data-v-f8c1fee9><span class="live-dot" data-v-f8c1fee9></span> 实时监控 </span></div><p class="sidebar-block-sub" data-v-f8c1fee9>直连官方白名单信源，全时段自动化采集</p>', 2)),
              createBaseVNode("div", _hoisted_111, [
                createBaseVNode("div", _hoisted_112, [
                  createBaseVNode("span", _hoisted_113, toDisplayString(((_f = status.value) == null ? void 0 : _f.totalVendors) || 20), 1),
                  _cache[46] || (_cache[46] = createBaseVNode("span", { class: "stat-mini-lbl" }, "监控厂商 (100%)", -1))
                ]),
                createBaseVNode("div", _hoisted_114, [
                  createBaseVNode("span", _hoisted_115, toDisplayString(((_g = status.value) == null ? void 0 : _g.activeSources) || 23), 1),
                  _cache[47] || (_cache[47] = createBaseVNode("span", { class: "stat-mini-lbl" }, "原厂信源", -1))
                ]),
                createBaseVNode("div", _hoisted_116, [
                  createBaseVNode("span", _hoisted_117, toDisplayString(officialUpdatesTotal.value || 391), 1),
                  _cache[48] || (_cache[48] = createBaseVNode("span", { class: "stat-mini-lbl" }, "官方原厂动态", -1))
                ]),
                createBaseVNode("div", _hoisted_118, [
                  createBaseVNode("span", _hoisted_119, toDisplayString(total.value || 15), 1),
                  _cache[49] || (_cache[49] = createBaseVNode("span", { class: "stat-mini-lbl" }, "已核实模型", -1))
                ])
              ]),
              createBaseVNode("div", _hoisted_120, [
                createBaseVNode("span", null, "⏱️ 最近同步: " + toDisplayString(((_h = status.value) == null ? void 0 : _h.lastCheckTime) || "刚刚"), 1)
              ])
            ]),
            createBaseVNode("div", _hoisted_121, [
              createBaseVNode("div", _hoisted_122, [
                _cache[52] || (_cache[52] = createBaseVNode("h4", { class: "sidebar-block-title" }, "近期活跃厂商", -1)),
                createVNode(_component_router_link, {
                  to: "/vendors",
                  class: "head-more-link"
                }, {
                  default: withCtx(() => [..._cache[51] || (_cache[51] = [
                    createTextVNode("全量目录 →", -1)
                  ])]),
                  _: 1
                })
              ]),
              _cache[53] || (_cache[53] = createBaseVNode("p", { class: "sidebar-block-sub" }, "按近 90 天官方发布频次与日期排布", -1)),
              createBaseVNode("div", _hoisted_123, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(recentActiveVendors.value, (v) => {
                  return openBlock(), createElementBlock("div", {
                    key: v.id,
                    class: normalizeClass(["active-vendor-row", { selected: selectedVendor.value === v.slug }]),
                    onClick: ($event) => selectVendor(v.slug)
                  }, [
                    createBaseVNode("div", _hoisted_125, [
                      createBaseVNode("span", {
                        class: "v-dot",
                        style: normalizeStyle({ backgroundColor: v.brand_color || "var(--obs-primary)" })
                      }, null, 4),
                      createBaseVNode("span", _hoisted_126, toDisplayString(v.name), 1)
                    ]),
                    createBaseVNode("div", _hoisted_127, [
                      createBaseVNode("span", _hoisted_128, toDisplayString(formatDate(v.latest_release_date)), 1),
                      createBaseVNode("span", _hoisted_129, toDisplayString(v.event_count) + " 条动态", 1)
                    ])
                  ], 10, _hoisted_124);
                }), 128))
              ])
            ]),
            createBaseVNode("div", _hoisted_130, [
              _cache[55] || (_cache[55] = createBaseVNode("div", { class: "portal-icon" }, "⏳", -1)),
              _cache[56] || (_cache[56] = createBaseVNode("h4", { class: "portal-title" }, "模型代际全景演进", -1)),
              _cache[57] || (_cache[57] = createBaseVNode("p", { class: "portal-desc" }, " 按年度与月份梳理全球各大模型架构、版本演变全景脉络。 ", -1)),
              createVNode(_component_router_link, {
                to: "/model-timeline",
                class: "portal-enter-btn"
              }, {
                default: withCtx(() => [..._cache[54] || (_cache[54] = [
                  createTextVNode(" 打开全景时间线 ↗ ", -1)
                ])]),
                _: 1
              })
            ])
          ])
        ])
      ]);
    };
  }
};
const AiHomeView = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-f8c1fee9"]]);
const _hoisted_1$f = { class: "models-observatory-page" };
const _hoisted_2$f = { class: "page-header-block" };
const _hoisted_3$f = { class: "models-stats-bar" };
const _hoisted_4$f = { class: "stat-pill" };
const _hoisted_5$f = { class: "stat-v" };
const _hoisted_6$e = { class: "stat-pill" };
const _hoisted_7$e = { class: "stat-v highlight" };
const _hoisted_8$e = { class: "stat-pill" };
const _hoisted_9$e = { class: "stat-v" };
const _hoisted_10$e = { class: "stat-pill" };
const _hoisted_11$d = { class: "stat-v highlight-amber" };
const _hoisted_12$d = { class: "control-panel" };
const _hoisted_13$c = { class: "search-row" };
const _hoisted_14$c = { class: "search-input-wrap" };
const _hoisted_15$c = { value: "" };
const _hoisted_16$b = ["value"];
const _hoisted_17$b = ["value"];
const _hoisted_18$b = { class: "capability-chips-row" };
const _hoisted_19$b = { class: "chip-buttons" };
const _hoisted_20$b = ["onClick"];
const _hoisted_21$b = {
  key: 0,
  class: "models-loading-grid"
};
const _hoisted_22$b = {
  key: 1,
  class: "models-empty-box"
};
const _hoisted_23$b = {
  key: 2,
  class: "models-grid"
};
const _hoisted_24$a = ["onClick"];
const _hoisted_25$a = { class: "card-top-meta" };
const _hoisted_26$9 = { class: "vendor-tag" };
const _hoisted_27$7 = { class: "vendor-name" };
const _hoisted_28$7 = { class: "model-title" };
const _hoisted_29$7 = { class: "model-series-line" };
const _hoisted_30$7 = {
  key: 0,
  class: "series-tag"
};
const _hoisted_31$6 = {
  key: 1,
  class: "key-tag font-mono"
};
const _hoisted_32$5 = { class: "modalities-group" };
const _sfc_main$f = {
  __name: "AiModelsView",
  setup(__props) {
    const router2 = useRouter();
    const models = /* @__PURE__ */ ref([]);
    const vendors = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    const searchKeyword = /* @__PURE__ */ ref("");
    const selectedVendorId = /* @__PURE__ */ ref("");
    const selectedModality = /* @__PURE__ */ ref("");
    const selectedStatus = /* @__PURE__ */ ref("");
    const capabilityOptions = [
      { key: "", label: "全部能力" },
      { key: "文本", label: "🧠 文本与推理" },
      { key: "代码", label: "⚡ 代码智能" },
      { key: "视觉", label: "👁️ 视觉与多模态" },
      { key: "语音", label: "🎙️ 语音交互" }
    ];
    const statusOptions = [
      { key: "", label: "全部开放形态" },
      { key: "WEIGHTS_OPEN", label: "模型权重开源 [WEIGHTS_OPEN]" },
      { key: "API_ONLY", label: "仅限云端 API [API_ONLY]" },
      { key: "AVAILABLE", label: "全面商用就绪 [AVAILABLE]" },
      { key: "PREVIEW", label: "公测/预览体验 [PREVIEW]" }
    ];
    const modelsVendorCount = computed(() => {
      return new Set(models.value.map((m) => m.vendorId)).size;
    });
    const errorMsg = /* @__PURE__ */ ref("");
    async function loadData() {
      loading.value = true;
      errorMsg.value = "";
      try {
        const [modelsRes, vendorsRes] = await Promise.all([
          aiApi.getModels(),
          aiApi.getVendors()
        ]);
        models.value = modelsRes || [];
        vendors.value = vendorsRes || [];
      } catch (e) {
        console.error("加载模型数据失败", e);
        errorMsg.value = e.message || "加载模型档案失败，请检查网络或后端服务";
      } finally {
        loading.value = false;
      }
    }
    const filteredModels = computed(() => {
      return models.value.filter((m) => {
        if (selectedVendorId.value && String(m.vendorId) !== String(selectedVendorId.value)) {
          return false;
        }
        if (selectedStatus.value && m.availabilityStatus !== selectedStatus.value) {
          return false;
        }
        if (selectedModality.value) {
          if (!m.modalities || !m.modalities.includes(selectedModality.value)) {
            return false;
          }
        }
        if (searchKeyword.value.trim()) {
          const q = searchKeyword.value.trim().toLowerCase();
          const matchName = m.displayName && m.displayName.toLowerCase().includes(q);
          const matchSeries = m.series && m.series.toLowerCase().includes(q);
          const matchKey = m.modelKey && m.modelKey.toLowerCase().includes(q);
          const matchVendor = m.vendorName && m.vendorName.toLowerCase().includes(q);
          if (!matchName && !matchSeries && !matchKey && !matchVendor) {
            return false;
          }
        }
        return true;
      });
    });
    function parseModalities(modStr) {
      if (!modStr) return [];
      return modStr.split(",").map((s) => s.trim()).filter(Boolean);
    }
    function getStatusBadge(status) {
      if (status === "WEIGHTS_OPEN") {
        return { text: "权重开源", color: "#E8B96E", bg: "rgba(232, 185, 110, 0.15)" };
      }
      if (status === "API_ONLY") {
        return { text: "云端 API", color: "#087D82", bg: "rgba(8, 125, 130, 0.15)" };
      }
      if (status === "AVAILABLE") {
        return { text: "全面可用", color: "#76D4CE", bg: "rgba(118, 212, 206, 0.15)" };
      }
      if (status === "PREVIEW") {
        return { text: "公测预览", color: "#EA735C", bg: "rgba(234, 115, 92, 0.15)" };
      }
      return { text: "收录中", color: "#59717a", bg: "rgba(89, 113, 122, 0.1)" };
    }
    function resetFilters() {
      searchKeyword.value = "";
      selectedVendorId.value = "";
      selectedModality.value = "";
      selectedStatus.value = "";
    }
    onMounted(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        createBaseVNode("header", _hoisted_2$f, [
          _cache[8] || (_cache[8] = createStaticVNode('<div class="header-pre-badge" data-v-2d9794d7><span class="badge-dot" data-v-2d9794d7></span><span class="badge-txt" data-v-2d9794d7>MODEL CATALOG // 前沿大模型档案库</span></div><h1 class="page-title" data-v-2d9794d7>AI 大模型档案库</h1><p class="page-desc" data-v-2d9794d7> 收录全球前沿核心大模型基准档案与衍生代际，建立规范化标识与官方存证索引，支持按研发厂商、核心能力与开放形态多维检索。 </p>', 3)),
          createBaseVNode("div", _hoisted_3$f, [
            createBaseVNode("div", _hoisted_4$f, [
              _cache[4] || (_cache[4] = createBaseVNode("span", { class: "stat-k" }, "本站建档基准模型:", -1)),
              createBaseVNode("span", _hoisted_5$f, toDisplayString(models.value.length) + " 款", 1)
            ]),
            createBaseVNode("div", _hoisted_6$e, [
              _cache[5] || (_cache[5] = createBaseVNode("span", { class: "stat-k" }, "已建档覆盖厂商:", -1)),
              createBaseVNode("span", _hoisted_7$e, toDisplayString(modelsVendorCount.value) + " 家", 1)
            ]),
            createBaseVNode("div", _hoisted_8$e, [
              _cache[6] || (_cache[6] = createBaseVNode("span", { class: "stat-k" }, "总巡检厂商基数:", -1)),
              createBaseVNode("span", _hoisted_9$e, toDisplayString(vendors.value.length) + " 家", 1)
            ]),
            createBaseVNode("div", _hoisted_10$e, [
              _cache[7] || (_cache[7] = createBaseVNode("span", { class: "stat-k" }, "当前筛选匹配:", -1)),
              createBaseVNode("span", _hoisted_11$d, toDisplayString(filteredModels.value.length) + " 项", 1)
            ])
          ])
        ]),
        createBaseVNode("section", _hoisted_12$d, [
          createBaseVNode("div", _hoisted_13$c, [
            createBaseVNode("div", _hoisted_14$c, [
              _cache[9] || (_cache[9] = createBaseVNode("span", { class: "search-icon" }, "🔍", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
                type: "text",
                placeholder: "搜索模型名称、系列代号、研发厂商或关键词...",
                class: "search-input"
              }, null, 512), [
                [vModelText, searchKeyword.value]
              ]),
              searchKeyword.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "clear-btn",
                onClick: _cache[1] || (_cache[1] = ($event) => searchKeyword.value = "")
              }, "×")) : createCommentVNode("", true)
            ]),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => selectedVendorId.value = $event),
              class: "filter-select"
            }, [
              createBaseVNode("option", _hoisted_15$c, "全部研发厂商 (" + toDisplayString(vendors.value.length) + ")", 1),
              (openBlock(true), createElementBlock(Fragment, null, renderList(vendors.value, (v) => {
                return openBlock(), createElementBlock("option", {
                  key: v.id,
                  value: v.id
                }, toDisplayString(v.name), 9, _hoisted_16$b);
              }), 128))
            ], 512), [
              [vModelSelect, selectedVendorId.value]
            ]),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => selectedStatus.value = $event),
              class: "filter-select"
            }, [
              (openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (opt) => {
                return createBaseVNode("option", {
                  key: opt.key,
                  value: opt.key
                }, toDisplayString(opt.label), 9, _hoisted_17$b);
              }), 64))
            ], 512), [
              [vModelSelect, selectedStatus.value]
            ])
          ]),
          createBaseVNode("div", _hoisted_18$b, [
            _cache[10] || (_cache[10] = createBaseVNode("span", { class: "chip-label" }, "核心能力分类：", -1)),
            createBaseVNode("div", _hoisted_19$b, [
              (openBlock(), createElementBlock(Fragment, null, renderList(capabilityOptions, (cap) => {
                return createBaseVNode("button", {
                  key: cap.key,
                  class: normalizeClass(["cap-filter-chip", { active: selectedModality.value === cap.key }]),
                  onClick: ($event) => selectedModality.value = cap.key
                }, toDisplayString(cap.label), 11, _hoisted_20$b);
              }), 64))
            ])
          ])
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_21$b, [
          (openBlock(), createElementBlock(Fragment, null, renderList(6, (i) => {
            return createBaseVNode("div", {
              key: i,
              class: "skeleton-model-card"
            });
          }), 64))
        ])) : filteredModels.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_22$b, [
          _cache[11] || (_cache[11] = createBaseVNode("span", { class: "empty-icon" }, "📂", -1)),
          _cache[12] || (_cache[12] = createBaseVNode("h3", { class: "empty-title" }, "未找到匹配的模型档案", -1)),
          _cache[13] || (_cache[13] = createBaseVNode("p", { class: "empty-sub" }, "尝试放宽搜索关键字或重置筛选条件", -1)),
          createBaseVNode("button", {
            class: "reset-filter-btn",
            onClick: resetFilters
          }, "重置全部筛选条件")
        ])) : (openBlock(), createElementBlock("div", _hoisted_23$b, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(filteredModels.value, (m) => {
            return openBlock(), createElementBlock("article", {
              key: m.id,
              class: "model-card",
              onClick: ($event) => unref(router2).push(`/models/${m.id}`)
            }, [
              createBaseVNode("div", _hoisted_25$a, [
                createBaseVNode("div", _hoisted_26$9, [
                  createBaseVNode("span", {
                    class: "vendor-dot",
                    style: normalizeStyle({ backgroundColor: m.brandColor || "var(--obs-primary)" })
                  }, null, 4),
                  createBaseVNode("span", _hoisted_27$7, toDisplayString(m.vendorName || "AI Lab"), 1)
                ]),
                createBaseVNode("span", {
                  class: "status-badge",
                  style: normalizeStyle({
                    color: getStatusBadge(m.availabilityStatus).color,
                    backgroundColor: getStatusBadge(m.availabilityStatus).bg
                  })
                }, toDisplayString(getStatusBadge(m.availabilityStatus).text), 5)
              ]),
              createBaseVNode("h3", _hoisted_28$7, toDisplayString(m.displayName), 1),
              createBaseVNode("div", _hoisted_29$7, [
                m.series ? (openBlock(), createElementBlock("span", _hoisted_30$7, "系列: " + toDisplayString(m.series), 1)) : createCommentVNode("", true),
                m.modelKey ? (openBlock(), createElementBlock("span", _hoisted_31$6, toDisplayString(m.modelKey), 1)) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_32$5, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(parseModalities(m.modalities), (mod) => {
                  return openBlock(), createElementBlock("span", {
                    key: mod,
                    class: "mod-tag"
                  }, " #" + toDisplayString(mod), 1);
                }), 128))
              ]),
              _cache[14] || (_cache[14] = createBaseVNode("div", { class: "card-footer" }, [
                createBaseVNode("span", { class: "enter-detail-link" }, "演进历程与证据链 →")
              ], -1))
            ], 8, _hoisted_24$a);
          }), 128))
        ]))
      ]);
    };
  }
};
const AiModelsView = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-2d9794d7"]]);
const _hoisted_1$e = { class: "model-detail-page" };
const _hoisted_2$e = { class: "back-nav-bar" };
const _hoisted_3$e = {
  key: 0,
  class: "detail-loading-box"
};
const _hoisted_4$e = {
  key: 1,
  class: "detail-error-card"
};
const _hoisted_5$e = { class: "error-desc" };
const _hoisted_6$d = {
  key: 2,
  class: "detail-content-wrap"
};
const _hoisted_7$d = { class: "model-hero-card" };
const _hoisted_8$d = { class: "hero-top-strip" };
const _hoisted_9$d = { class: "vendor-identity" };
const _hoisted_10$d = {
  key: 1,
  class: "vendor-name-txt"
};
const _hoisted_11$c = { class: "model-hero-title" };
const _hoisted_12$c = { class: "model-meta-line" };
const _hoisted_13$b = {
  key: 0,
  class: "meta-item"
};
const _hoisted_14$b = {
  key: 1,
  class: "meta-item font-mono"
};
const _hoisted_15$b = {
  key: 2,
  class: "meta-item"
};
const _hoisted_16$a = { class: "modalities-tag-group" };
const _hoisted_17$a = { class: "events-history-section" };
const _hoisted_18$a = { class: "section-title-line" };
const _hoisted_19$a = { class: "section-count" };
const _hoisted_20$a = {
  key: 0,
  class: "no-events-box events-err-box"
};
const _hoisted_21$a = { class: "err-tip" };
const _hoisted_22$a = {
  key: 1,
  class: "no-events-box"
};
const _hoisted_23$a = {
  key: 2,
  class: "events-cards-list"
};
const _hoisted_24$9 = { class: "event-card-header" };
const _hoisted_25$9 = { class: "event-date-row" };
const _hoisted_26$8 = { class: "ev-date-val" };
const _hoisted_27$6 = {
  key: 0,
  class: "ev-stage-tag"
};
const _hoisted_28$6 = { class: "ev-summary-content" };
const _hoisted_29$6 = {
  key: 0,
  class: "evidence-list-block"
};
const _hoisted_30$6 = { class: "evidence-links-wrap" };
const _hoisted_31$5 = ["href"];
const _hoisted_32$4 = { class: "proof-title" };
const _sfc_main$e = {
  __name: "AiModelDetailView",
  setup(__props) {
    const route = useRoute();
    useRouter();
    const model = /* @__PURE__ */ ref(null);
    const relatedEvents = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    const errorMsg = /* @__PURE__ */ ref("");
    const eventsErrorMsg = /* @__PURE__ */ ref("");
    async function loadDetail() {
      loading.value = true;
      errorMsg.value = "";
      eventsErrorMsg.value = "";
      const modelId = route.params.id;
      try {
        const modelRes = await aiApi.getModelDetail(modelId);
        model.value = modelRes;
      } catch (err) {
        console.error("加载模型详情失败", err);
        errorMsg.value = err.message || "未找到该模型档案，可能尚未收录或已被移除";
        loading.value = false;
        return;
      }
      try {
        const eventsRes = await aiApi.getModelEvents(modelId);
        relatedEvents.value = eventsRes || [];
      } catch (err) {
        console.error("加载模型事件历程失败", err);
        eventsErrorMsg.value = "加载官方演进历史失败，请点击重试";
      } finally {
        loading.value = false;
      }
    }
    async function retryLoadEvents() {
      const modelId = route.params.id;
      eventsErrorMsg.value = "";
      try {
        const eventsRes = await aiApi.getModelEvents(modelId);
        relatedEvents.value = eventsRes || [];
      } catch (err) {
        console.error("重试加载模型事件失败", err);
        eventsErrorMsg.value = "重试加载失败，请检查网络或后端服务";
      }
    }
    function parseModalities(modStr) {
      if (!modStr) return [];
      return modStr.split(",").map((s) => s.trim()).filter(Boolean);
    }
    function getStatusBadge(status) {
      if (status === "WEIGHTS_OPEN") {
        return { text: "权重完全开源", color: "#E8B96E", bg: "rgba(232, 185, 110, 0.15)" };
      }
      if (status === "API_ONLY") {
        return { text: "仅限云端 API", color: "#087D82", bg: "rgba(8, 125, 130, 0.15)" };
      }
      if (status === "AVAILABLE") {
        return { text: "全面商用就绪", color: "#76D4CE", bg: "rgba(118, 212, 206, 0.15)" };
      }
      if (status === "PREVIEW") {
        return { text: "公测/预览体验", color: "#EA735C", bg: "rgba(234, 115, 92, 0.15)" };
      }
      return { text: status || "收录中", color: "#59717a", bg: "rgba(89, 113, 122, 0.1)" };
    }
    function getEventTypeBadge(type) {
      const map = {
        WEIGHTS_RELEASE: { text: "权重开源", color: "#E8B96E", bg: "rgba(232, 185, 110, 0.15)" },
        MODEL_RELEASE: { text: "首代发布", color: "#087D82", bg: "rgba(8, 125, 130, 0.15)" },
        VERSION_UPDATE: { text: "版本升级", color: "#76D4CE", bg: "rgba(118, 212, 206, 0.15)" },
        API_AVAILABLE: { text: "API 开放", color: "#EA735C", bg: "rgba(234, 115, 92, 0.15)" }
      };
      return map[type] || { text: "发布动态", color: "#59717a", bg: "rgba(89, 113, 122, 0.15)" };
    }
    function formatDate(dateStr) {
      if (!dateStr) return "-";
      return dateStr.substring(0, 10);
    }
    onMounted(() => {
      loadDetail();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createBaseVNode("nav", _hoisted_2$e, [
          createVNode(_component_router_link, {
            to: "/models",
            class: "back-link-btn"
          }, {
            default: withCtx(() => [..._cache[0] || (_cache[0] = [
              createTextVNode(" ← 返回模型档案库 ", -1)
            ])]),
            _: 1
          })
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_3$e, [..._cache[1] || (_cache[1] = [
          createBaseVNode("div", { class: "loading-pulse-bar" }, null, -1),
          createBaseVNode("p", { class: "loading-tip" }, "正在调取模型全量基准与官方证据链...", -1)
        ])])) : errorMsg.value ? (openBlock(), createElementBlock("div", _hoisted_4$e, [
          _cache[3] || (_cache[3] = createBaseVNode("span", { class: "error-ico" }, "⚠️", -1)),
          _cache[4] || (_cache[4] = createBaseVNode("h3", { class: "error-title" }, "无法查看模型档案", -1)),
          createBaseVNode("p", _hoisted_5$e, toDisplayString(errorMsg.value), 1),
          createVNode(_component_router_link, {
            to: "/models",
            class: "error-back-btn"
          }, {
            default: withCtx(() => [..._cache[2] || (_cache[2] = [
              createTextVNode("返回模型目录", -1)
            ])]),
            _: 1
          })
        ])) : model.value ? (openBlock(), createElementBlock("div", _hoisted_6$d, [
          createBaseVNode("section", _hoisted_7$d, [
            createBaseVNode("div", _hoisted_8$d, [
              createBaseVNode("div", _hoisted_9$d, [
                createBaseVNode("span", {
                  class: "vendor-dot",
                  style: normalizeStyle({ backgroundColor: model.value.brandColor || "var(--obs-primary)" })
                }, null, 4),
                model.value.vendorSlug ? (openBlock(), createBlock(_component_router_link, {
                  key: 0,
                  to: `/vendors/${model.value.vendorSlug}`,
                  class: "vendor-anchor"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(model.value.vendorName), 1)
                  ]),
                  _: 1
                }, 8, ["to"])) : (openBlock(), createElementBlock("span", _hoisted_10$d, toDisplayString(model.value.vendorName), 1))
              ]),
              createBaseVNode("span", {
                class: "status-pill",
                style: normalizeStyle({
                  color: getStatusBadge(model.value.availabilityStatus).color,
                  backgroundColor: getStatusBadge(model.value.availabilityStatus).bg
                })
              }, toDisplayString(getStatusBadge(model.value.availabilityStatus).text), 5)
            ]),
            createBaseVNode("h1", _hoisted_11$c, toDisplayString(model.value.displayName), 1),
            createBaseVNode("div", _hoisted_12$c, [
              model.value.series ? (openBlock(), createElementBlock("span", _hoisted_13$b, "所属系列: " + toDisplayString(model.value.series), 1)) : createCommentVNode("", true),
              model.value.modelKey ? (openBlock(), createElementBlock("span", _hoisted_14$b, "标识: " + toDisplayString(model.value.modelKey), 1)) : createCommentVNode("", true),
              model.value.createdAt ? (openBlock(), createElementBlock("span", _hoisted_15$b, "收录时间: " + toDisplayString(formatDate(model.value.createdAt)), 1)) : createCommentVNode("", true)
            ]),
            createBaseVNode("div", _hoisted_16$a, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(parseModalities(model.value.modalities), (m) => {
                return openBlock(), createElementBlock("span", {
                  key: m,
                  class: "hero-mod-pill"
                }, " #" + toDisplayString(m), 1);
              }), 128))
            ])
          ]),
          createBaseVNode("section", _hoisted_17$a, [
            createBaseVNode("div", _hoisted_18$a, [
              _cache[5] || (_cache[5] = createBaseVNode("h2", { class: "section-title" }, "官方发布历史与存证凭据", -1)),
              createBaseVNode("span", _hoisted_19$a, "共 " + toDisplayString(relatedEvents.value.length) + " 项已核实记录", 1)
            ]),
            eventsErrorMsg.value ? (openBlock(), createElementBlock("div", _hoisted_20$a, [
              createBaseVNode("p", _hoisted_21$a, toDisplayString(eventsErrorMsg.value), 1),
              createBaseVNode("button", {
                class: "retry-btn",
                onClick: retryLoadEvents
              }, "重试加载演进历程")
            ])) : relatedEvents.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_22$a, [
              _cache[6] || (_cache[6] = createBaseVNode("div", { class: "no-events-icon" }, "📋", -1)),
              _cache[7] || (_cache[7] = createBaseVNode("h3", { class: "no-events-title" }, "已收录基准档案，演进历程比对中", -1)),
              _cache[8] || (_cache[8] = createBaseVNode("p", { class: "no-events-desc" }, " 该模型已录入基准档案库。相关的代际首发、版本升级与官方存证正由巡检引擎持续比对中。 ", -1)),
              model.value.vendorSlug ? (openBlock(), createBlock(_component_router_link, {
                key: 0,
                to: `/vendors/${model.value.vendorSlug}`,
                class: "goto-vendor-btn font-mono"
              }, {
                default: withCtx(() => [
                  createTextVNode(" 查看 " + toDisplayString(model.value.vendorName) + " 官方动态资讯 ↗ ", 1)
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true)
            ])) : (openBlock(), createElementBlock("div", _hoisted_23$a, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(relatedEvents.value, (ev) => {
                return openBlock(), createElementBlock("article", {
                  key: ev.id,
                  class: "event-history-card"
                }, [
                  createBaseVNode("div", _hoisted_24$9, [
                    createBaseVNode("div", _hoisted_25$9, [
                      _cache[9] || (_cache[9] = createBaseVNode("span", { class: "ev-date-icon" }, "📅", -1)),
                      createBaseVNode("span", _hoisted_26$8, toDisplayString(formatDate(ev.releaseDate || ev.firstSeenAt)), 1),
                      ev.stage ? (openBlock(), createElementBlock("span", _hoisted_27$6, toDisplayString(ev.stage), 1)) : createCommentVNode("", true)
                    ]),
                    createBaseVNode("span", {
                      class: "event-type-badge",
                      style: normalizeStyle({
                        color: getEventTypeBadge(ev.eventType).color,
                        backgroundColor: getEventTypeBadge(ev.eventType).bg
                      })
                    }, toDisplayString(getEventTypeBadge(ev.eventType).text), 5)
                  ]),
                  createBaseVNode("p", _hoisted_28$6, toDisplayString(ev.summary), 1),
                  ev.evidences && ev.evidences.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_29$6, [
                    _cache[12] || (_cache[12] = createBaseVNode("span", { class: "evidence-heading" }, "官方溯源存证依据：", -1)),
                    createBaseVNode("div", _hoisted_30$6, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(ev.evidences, (proof) => {
                        return openBlock(), createElementBlock("a", {
                          key: proof.id,
                          href: proof.officialUrl,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          class: "official-proof-chip"
                        }, [
                          _cache[10] || (_cache[10] = createBaseVNode("span", { class: "proof-ico" }, "🔗", -1)),
                          createBaseVNode("span", _hoisted_32$4, toDisplayString(proof.title || "官方发布原文"), 1),
                          _cache[11] || (_cache[11] = createBaseVNode("span", { class: "proof-arrow" }, "↗", -1))
                        ], 8, _hoisted_31$5);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true)
                ]);
              }), 128))
            ]))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const AiModelDetailView = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-a302f395"]]);
const _hoisted_1$d = { class: "ai-vendors-page" };
const _hoisted_2$d = { class: "page-header-block" };
const _hoisted_3$d = { class: "vendor-stats-bar" };
const _hoisted_4$d = { class: "v-stat-pill" };
const _hoisted_5$d = { class: "v-val" };
const _hoisted_6$c = { class: "v-stat-pill" };
const _hoisted_7$c = { class: "v-val highlight" };
const _hoisted_8$c = { class: "v-stat-pill" };
const _hoisted_9$c = { class: "v-val highlight-amber" };
const _hoisted_10$c = {
  key: 0,
  class: "vendors-skeleton-grid"
};
const _hoisted_11$b = {
  key: 1,
  class: "vendors-grid"
};
const _hoisted_12$b = { class: "card-top-row" };
const _hoisted_13$a = { class: "vendor-identity" };
const _hoisted_14$a = { class: "vendor-avatar" };
const _hoisted_15$a = { class: "vendor-titles" };
const _hoisted_16$9 = { class: "vendor-name" };
const _hoisted_17$9 = { class: "vendor-slug" };
const _hoisted_18$9 = {
  key: 0,
  class: "vendor-region-chip"
};
const _hoisted_19$9 = { class: "vendor-status-triad" };
const _hoisted_20$9 = { class: "triad-dot" };
const _hoisted_21$9 = { class: "triad-label" };
const _hoisted_22$9 = { class: "triad-dot" };
const _hoisted_23$9 = { class: "triad-label" };
const _hoisted_24$8 = { class: "vendor-card-footer" };
const _hoisted_25$8 = ["href"];
const _sfc_main$d = {
  __name: "AiVendorsView",
  setup(__props) {
    const vendors = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    async function loadVendors() {
      loading.value = true;
      try {
        const list = await aiApi.getVendors();
        vendors.value = list || [];
      } catch (e) {
        console.error("加载厂商目录失败", e);
      } finally {
        loading.value = false;
      }
    }
    const stats = computed(() => {
      const total = vendors.value.length;
      const activeSources = vendors.value.filter((v) => (v.activeSourcesCount || 0) > 0).length;
      const withEvents = vendors.value.filter((v) => (v.confirmedEventsCount || 0) > 0).length;
      return { total, activeSources, withEvents };
    });
    onMounted(() => {
      loadVendors();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        createBaseVNode("header", _hoisted_2$d, [
          _cache[4] || (_cache[4] = createStaticVNode('<div class="header-pre-badge" data-v-342b5abc><span class="badge-dot" data-v-342b5abc></span><span class="badge-txt" data-v-342b5abc>VENDOR DIRECTORY // 厂商全景索引</span></div><h1 class="page-title" data-v-342b5abc>AI 研发机构与厂商档案</h1><p class="page-desc" data-v-342b5abc> 收录全球核心大模型研发实验室与科技企业官方发布通道，严格区分官方信源启用与已核实发布动态。 </p>', 3)),
          createBaseVNode("div", _hoisted_3$d, [
            createBaseVNode("div", _hoisted_4$d, [
              _cache[1] || (_cache[1] = createBaseVNode("span", { class: "v-lbl" }, "已登记厂商:", -1)),
              createBaseVNode("span", _hoisted_5$d, toDisplayString(stats.value.total) + " 家", 1)
            ]),
            createBaseVNode("div", _hoisted_6$c, [
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "v-lbl" }, "已启用官方来源:", -1)),
              createBaseVNode("span", _hoisted_7$c, toDisplayString(stats.value.activeSources) + " 家", 1)
            ]),
            createBaseVNode("div", _hoisted_8$c, [
              _cache[3] || (_cache[3] = createBaseVNode("span", { class: "v-lbl" }, "有已核实发布:", -1)),
              createBaseVNode("span", _hoisted_9$c, toDisplayString(stats.value.withEvents) + " 家", 1)
            ])
          ])
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_10$c, [
          (openBlock(), createElementBlock(Fragment, null, renderList(8, (i) => {
            return createBaseVNode("div", {
              key: i,
              class: "skeleton-vendor-card"
            });
          }), 64))
        ])) : (openBlock(), createElementBlock("div", _hoisted_11$b, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(vendors.value, (v) => {
            return openBlock(), createBlock(_component_router_link, {
              key: v.slug,
              to: `/vendors/${v.slug}`,
              class: "vendor-box-card",
              style: normalizeStyle({ "--brand-color": v.brandColor || "var(--obs-primary)" })
            }, {
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_12$b, [
                  createBaseVNode("div", _hoisted_13$a, [
                    createBaseVNode("span", {
                      class: "vendor-dot",
                      style: normalizeStyle({ backgroundColor: v.brandColor || "var(--obs-primary)" })
                    }, null, 4),
                    createBaseVNode("div", _hoisted_14$a, toDisplayString(v.name.slice(0, 2).toUpperCase()), 1),
                    createBaseVNode("div", _hoisted_15$a, [
                      createBaseVNode("h2", _hoisted_16$9, toDisplayString(v.name), 1),
                      createBaseVNode("span", _hoisted_17$9, "@" + toDisplayString(v.slug), 1)
                    ])
                  ]),
                  v.region && v.region !== "未知" ? (openBlock(), createElementBlock("span", _hoisted_18$9, toDisplayString(v.region), 1)) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_19$9, [
                  _cache[5] || (_cache[5] = createBaseVNode("div", { class: "triad-item active" }, [
                    createBaseVNode("span", { class: "triad-dot" }, "●"),
                    createBaseVNode("span", { class: "triad-label" }, "已登记档案")
                  ], -1)),
                  createBaseVNode("div", {
                    class: normalizeClass(["triad-item", (v.activeSourcesCount || 0) > 0 ? "enabled" : "inactive"])
                  }, [
                    createBaseVNode("span", _hoisted_20$9, toDisplayString((v.activeSourcesCount || 0) > 0 ? "●" : "○"), 1),
                    createBaseVNode("span", _hoisted_21$9, toDisplayString((v.activeSourcesCount || 0) > 0 ? `已启用官方源 (${v.activeSourcesCount})` : "待接入信源"), 1)
                  ], 2),
                  createBaseVNode("div", {
                    class: normalizeClass(["triad-item", (v.confirmedEventsCount || 0) > 0 ? "confirmed" : "inactive"])
                  }, [
                    createBaseVNode("span", _hoisted_22$9, toDisplayString((v.confirmedEventsCount || 0) > 0 ? "●" : "○"), 1),
                    createBaseVNode("span", _hoisted_23$9, toDisplayString((v.confirmedEventsCount || 0) > 0 ? `${v.confirmedEventsCount} 条已核实发布` : "暂无审计事件"), 1)
                  ], 2)
                ]),
                createBaseVNode("div", _hoisted_24$8, [
                  _cache[6] || (_cache[6] = createBaseVNode("span", { class: "view-history-btn" }, "查看模型与历史 →", -1)),
                  v.websiteUrl ? (openBlock(), createElementBlock("a", {
                    key: 0,
                    href: v.websiteUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "ext-home-btn",
                    onClick: _cache[0] || (_cache[0] = withModifiers(() => {
                    }, ["stop"]))
                  }, " 官网 ↗ ", 8, _hoisted_25$8)) : createCommentVNode("", true)
                ])
              ]),
              _: 2
            }, 1032, ["to", "style"]);
          }), 128))
        ]))
      ]);
    };
  }
};
const AiVendorsView = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-342b5abc"]]);
const _hoisted_1$c = { class: "vendor-detail-page" };
const _hoisted_2$c = {
  key: 0,
  class: "detail-loading-box"
};
const _hoisted_3$c = {
  key: 1,
  class: "detail-error-box"
};
const _hoisted_4$c = { class: "err-tip" };
const _hoisted_5$c = {
  key: 2,
  class: "vendor-content-flow"
};
const _hoisted_6$b = { class: "vendor-hero-row" };
const _hoisted_7$b = { class: "vendor-badge-icon font-mono" };
const _hoisted_8$b = { class: "vendor-meta-main" };
const _hoisted_9$b = { class: "name-row" };
const _hoisted_10$b = { class: "vendor-name" };
const _hoisted_11$a = { class: "region-badge" };
const _hoisted_12$a = { class: "vendor-slug font-mono" };
const _hoisted_13$9 = ["href"];
const _hoisted_14$9 = { class: "section-block" };
const _hoisted_15$9 = { class: "sub-heading-wrap" };
const _hoisted_16$8 = { class: "sub-heading" };
const _hoisted_17$8 = {
  key: 0,
  class: "empty-hint"
};
const _hoisted_18$8 = {
  key: 1,
  class: "models-grid"
};
const _hoisted_19$8 = { class: "model-head-line" };
const _hoisted_20$8 = { class: "model-name-text" };
const _hoisted_21$8 = { class: "avail-badge font-mono" };
const _hoisted_22$8 = { class: "model-meta-info font-mono" };
const _hoisted_23$8 = { class: "section-block" };
const _hoisted_24$7 = { class: "sub-heading-wrap" };
const _hoisted_25$7 = { class: "sub-heading" };
const _hoisted_26$7 = {
  key: 0,
  class: "empty-hint"
};
const _hoisted_27$5 = {
  key: 1,
  class: "vendor-events-list"
};
const _hoisted_28$5 = { class: "ev-date-side font-mono" };
const _hoisted_29$5 = { class: "ev-main-side" };
const _hoisted_30$5 = { class: "ev-title" };
const _hoisted_31$4 = { class: "ev-summary" };
const _hoisted_32$3 = {
  key: 0,
  class: "ev-evidences"
};
const _hoisted_33$3 = ["href"];
const _hoisted_34$3 = { class: "section-block" };
const _hoisted_35$3 = { class: "sub-heading-wrap" };
const _hoisted_36$3 = { class: "sub-heading" };
const _hoisted_37$3 = {
  key: 0,
  class: "empty-hint"
};
const _hoisted_38$3 = {
  key: 1,
  class: "vendor-updates-grid"
};
const _hoisted_39$3 = { class: "update-meta-row font-mono" };
const _hoisted_40$3 = { class: "update-date" };
const _hoisted_41$3 = { class: "update-cat-badge" };
const _hoisted_42$3 = { class: "update-title" };
const _hoisted_43$2 = ["href"];
const _hoisted_44$2 = { class: "update-footer" };
const _hoisted_45$2 = { class: "vendor-tag font-mono" };
const _hoisted_46$2 = ["href"];
const _sfc_main$c = {
  __name: "AiVendorDetailView",
  setup(__props) {
    const route = useRoute();
    const router2 = useRouter();
    const vendor = /* @__PURE__ */ ref(null);
    const models = /* @__PURE__ */ ref([]);
    const events = /* @__PURE__ */ ref([]);
    const eventsTotal = /* @__PURE__ */ ref(0);
    const officialUpdates = /* @__PURE__ */ ref([]);
    const officialUpdatesTotal = /* @__PURE__ */ ref(0);
    const loading = /* @__PURE__ */ ref(true);
    const errorMsg = /* @__PURE__ */ ref("");
    async function loadDetail() {
      const slug = route.params.slug;
      if (!slug) return;
      loading.value = true;
      errorMsg.value = "";
      try {
        const v = await aiApi.getVendorDetail(slug);
        vendor.value = v;
        if (v && v.id) {
          const [modelsRes, eventsRes, updatesRes] = await Promise.all([
            aiApi.getModels({ vendorId: v.id }),
            aiApi.getEvents({ vendor: slug, size: 50 }),
            aiApi.getOfficialUpdates({ vendorId: v.id, size: 30 }).catch(() => ({ list: [], total: 0 }))
          ]);
          models.value = modelsRes || [];
          events.value = eventsRes.list || [];
          eventsTotal.value = eventsRes.total !== void 0 ? eventsRes.total : events.value.length;
          officialUpdates.value = updatesRes.list || [];
          officialUpdatesTotal.value = updatesRes.total !== void 0 ? updatesRes.total : officialUpdates.value.length;
        }
      } catch (e) {
        console.error("加载厂商详情失败", e);
        errorMsg.value = e.message || "加载厂商档案详情失败，请检查网络或后端服务";
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      loadDetail();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$c, [
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_2$c, [..._cache[1] || (_cache[1] = [
          createBaseVNode("div", { class: "loading-pulse-line" }, null, -1),
          createBaseVNode("p", null, "正在同步厂商全景档案与官方动态数据...", -1)
        ])])) : errorMsg.value ? (openBlock(), createElementBlock("div", _hoisted_3$c, [
          createBaseVNode("p", _hoisted_4$c, toDisplayString(errorMsg.value), 1),
          createBaseVNode("button", {
            class: "retry-btn",
            onClick: loadDetail
          }, "重新加载")
        ])) : vendor.value ? (openBlock(), createElementBlock("div", _hoisted_5$c, [
          createBaseVNode("div", {
            class: "detail-header-card",
            style: normalizeStyle({ "--brand-color": vendor.value.brandColor || "#3b82f6" })
          }, [
            createBaseVNode("button", {
              class: "back-link-btn font-mono",
              onClick: _cache[0] || (_cache[0] = ($event) => unref(router2).back())
            }, "← 返回厂商列表"),
            createBaseVNode("div", _hoisted_6$b, [
              createBaseVNode("div", _hoisted_7$b, toDisplayString(vendor.value.name.slice(0, 2).toUpperCase()), 1),
              createBaseVNode("div", _hoisted_8$b, [
                createBaseVNode("div", _hoisted_9$b, [
                  createBaseVNode("h1", _hoisted_10$b, toDisplayString(vendor.value.name), 1),
                  createBaseVNode("span", _hoisted_11$a, toDisplayString(vendor.value.region), 1)
                ]),
                createBaseVNode("p", _hoisted_12$a, "SLUG: " + toDisplayString(vendor.value.slug), 1)
              ]),
              vendor.value.websiteUrl ? (openBlock(), createElementBlock("a", {
                key: 0,
                href: vendor.value.websiteUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "vendor-site-btn font-mono"
              }, " 访问官方发布来源 ↗ ", 8, _hoisted_13$9)) : createCommentVNode("", true)
            ])
          ], 4),
          createBaseVNode("section", _hoisted_14$9, [
            createBaseVNode("div", _hoisted_15$9, [
              createBaseVNode("h2", _hoisted_16$8, "旗下收录大模型 (" + toDisplayString(models.value.length) + ")", 1),
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "sub-heading-note" }, "已建档的基准模型与衍生版本", -1))
            ]),
            models.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_17$8, "暂未收录该厂商的独立大模型档案")) : (openBlock(), createElementBlock("div", _hoisted_18$8, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(models.value, (m) => {
                return openBlock(), createBlock(_component_router_link, {
                  key: m.id,
                  to: `/models/${m.id}`,
                  class: "model-chip-card"
                }, {
                  default: withCtx(() => [
                    createBaseVNode("div", _hoisted_19$8, [
                      createBaseVNode("h3", _hoisted_20$8, toDisplayString(m.displayName), 1),
                      createBaseVNode("span", _hoisted_21$8, toDisplayString(m.availabilityStatus), 1)
                    ]),
                    createBaseVNode("div", _hoisted_22$8, [
                      createBaseVNode("span", null, "系列: " + toDisplayString(m.series || "通用"), 1),
                      _cache[3] || (_cache[3] = createBaseVNode("span", null, "·", -1)),
                      createBaseVNode("span", null, "模态: " + toDisplayString(m.modalities || "多模态"), 1)
                    ])
                  ]),
                  _: 2
                }, 1032, ["to"]);
              }), 128))
            ]))
          ]),
          createBaseVNode("section", _hoisted_23$8, [
            createBaseVNode("div", _hoisted_24$7, [
              createBaseVNode("h2", _hoisted_25$7, "已核实模型发布里程碑 (" + toDisplayString(eventsTotal.value) + ")", 1),
              _cache[4] || (_cache[4] = createBaseVNode("span", { class: "sub-heading-note" }, "经官方存证核实的人工确认模型演进事件", -1))
            ]),
            events.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_26$7, "暂无已确认的模型里程碑事件")) : (openBlock(), createElementBlock("div", _hoisted_27$5, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(events.value, (ev) => {
                return openBlock(), createElementBlock("div", {
                  key: ev.id,
                  class: "vendor-event-row"
                }, [
                  createBaseVNode("div", _hoisted_28$5, toDisplayString(ev.releaseDate || (ev.firstSeenAt ? ev.firstSeenAt.slice(0, 10) : "未记录")), 1),
                  createBaseVNode("div", _hoisted_29$5, [
                    createBaseVNode("h3", _hoisted_30$5, toDisplayString(ev.modelName) + " · " + toDisplayString(ev.stage || "发布"), 1),
                    createBaseVNode("p", _hoisted_31$4, toDisplayString(ev.summary), 1),
                    ev.evidences && ev.evidences.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_32$3, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(ev.evidences, (evi) => {
                        return openBlock(), createElementBlock("a", {
                          key: evi.id,
                          href: evi.officialUrl,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          class: "evidence-link"
                        }, " 🔗 官方存证: " + toDisplayString(evi.title || evi.officialUrl) + " ↗ ", 9, _hoisted_33$3);
                      }), 128))
                    ])) : createCommentVNode("", true)
                  ])
                ]);
              }), 128))
            ]))
          ]),
          createBaseVNode("section", _hoisted_34$3, [
            createBaseVNode("div", _hoisted_35$3, [
              createBaseVNode("h2", _hoisted_36$3, "官方原厂最新动态与公告 (" + toDisplayString(officialUpdatesTotal.value) + ")", 1),
              _cache[5] || (_cache[5] = createBaseVNode("span", { class: "sub-heading-note" }, "来自厂商官方博客、新闻稿或模型卡源的直达资讯流", -1))
            ]),
            officialUpdates.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_37$3, " 暂未检索到该厂商的官方动态抓取记录 ")) : (openBlock(), createElementBlock("div", _hoisted_38$3, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(officialUpdates.value, (item) => {
                var _a;
                return openBlock(), createElementBlock("article", {
                  key: item.id,
                  class: "update-card"
                }, [
                  createBaseVNode("div", _hoisted_39$3, [
                    createBaseVNode("span", _hoisted_40$3, toDisplayString(item.publishedAt || ((_a = item.firstSeenAt) == null ? void 0 : _a.slice(0, 10)) || "日期待核实"), 1),
                    createBaseVNode("span", _hoisted_41$3, toDisplayString(item.categoryName || "官方资讯"), 1)
                  ]),
                  createBaseVNode("h4", _hoisted_42$3, [
                    createBaseVNode("a", {
                      href: item.canonicalUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: "update-link"
                    }, toDisplayString(item.title) + " ↗ ", 9, _hoisted_43$2)
                  ]),
                  createBaseVNode("div", _hoisted_44$2, [
                    createBaseVNode("span", _hoisted_45$2, "来源: " + toDisplayString(vendor.value.name), 1),
                    createBaseVNode("a", {
                      href: item.canonicalUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: "read-source-btn font-mono"
                    }, " 阅读官方原文 ", 8, _hoisted_46$2)
                  ])
                ]);
              }), 128))
            ]))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const AiVendorDetailView = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-28fa634d"]]);
const _hoisted_1$b = { class: "timeline-observatory-page" };
const _hoisted_2$b = { class: "page-header-block" };
const _hoisted_3$b = { class: "page-desc" };
const _hoisted_4$b = {
  key: 0,
  class: "month-jump-bar"
};
const _hoisted_5$b = { class: "month-tags" };
const _hoisted_6$a = ["onClick"];
const _hoisted_7$a = {
  key: 0,
  class: "timeline-loading-state"
};
const _hoisted_8$a = {
  key: 1,
  class: "timeline-error-box"
};
const _hoisted_9$a = { class: "err-tip" };
const _hoisted_10$a = {
  key: 2,
  class: "timeline-flow"
};
const _hoisted_11$9 = ["id"];
const _hoisted_12$9 = ["onClick"];
const _hoisted_13$8 = { class: "month-title-wrap" };
const _hoisted_14$8 = { class: "month-title" };
const _hoisted_15$8 = { class: "month-badge" };
const _hoisted_16$7 = { class: "collapse-toggle" };
const _hoisted_17$7 = { class: "month-events-column" };
const _hoisted_18$7 = { class: "card-inner" };
const _hoisted_19$7 = { class: "card-meta-row" };
const _hoisted_20$7 = { class: "meta-left" };
const _hoisted_21$7 = { class: "ev-date" };
const _hoisted_22$7 = { class: "ev-model-name" };
const _hoisted_23$7 = { key: 1 };
const _hoisted_24$6 = { class: "ev-summary" };
const _hoisted_25$6 = { class: "ev-card-foot" };
const _hoisted_26$6 = { class: "ev-mod-tags" };
const _hoisted_27$4 = {
  key: 0,
  class: "stage-chip"
};
const _hoisted_28$4 = {
  key: 1,
  class: "avail-chip"
};
const _hoisted_29$4 = ["href"];
const _hoisted_30$4 = {
  key: 3,
  class: "timeline-empty-box"
};
const _sfc_main$b = {
  __name: "AiTimelineView",
  setup(__props) {
    const events = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    const errorMsg = /* @__PURE__ */ ref("");
    const collapsedMonths = /* @__PURE__ */ ref(/* @__PURE__ */ new Set());
    async function loadTimeline() {
      loading.value = true;
      errorMsg.value = "";
      try {
        const res = await aiApi.getTimeline();
        events.value = res || [];
      } catch (e) {
        console.error("加载时间线失败", e);
        errorMsg.value = e.message || "加载全球演进时间线失败，请检查网络或后端服务";
      } finally {
        loading.value = false;
      }
    }
    const timelineGroups = computed(() => {
      const groups = {};
      for (const ev of events.value) {
        const dateStr = ev.releaseDate || ev.firstSeenAt || "未知日期";
        const monthKey = dateStr.length >= 7 ? dateStr.substring(0, 7) : "其他";
        if (!groups[monthKey]) {
          groups[monthKey] = {
            month: monthKey,
            events: []
          };
        }
        groups[monthKey].events.push(ev);
      }
      return Object.values(groups).sort((a, b) => b.month.localeCompare(a.month));
    });
    function toggleMonth(month) {
      if (collapsedMonths.value.has(month)) {
        collapsedMonths.value.delete(month);
      } else {
        collapsedMonths.value.add(month);
      }
    }
    function scrollToMonth(month) {
      const el = document.getElementById(`month-${month}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    function getEventTypeBadge(type) {
      const map = {
        WEIGHTS_RELEASE: { text: "权重开源", color: "#E8B96E", bg: "rgba(232, 185, 110, 0.15)" },
        MODEL_RELEASE: { text: "首代发布", color: "#087D82", bg: "rgba(8, 125, 130, 0.15)" },
        VERSION_UPDATE: { text: "版本升级", color: "#76D4CE", bg: "rgba(118, 212, 206, 0.15)" },
        API_AVAILABLE: { text: "API 开放", color: "#EA735C", bg: "rgba(234, 115, 92, 0.15)" }
      };
      return map[type] || { text: "发布动态", color: "#59717a", bg: "rgba(89, 113, 122, 0.15)" };
    }
    function formatDate(dateStr) {
      if (!dateStr) return "-";
      return dateStr.substring(0, 10);
    }
    function formatMonthLabel(monthKey) {
      if (!monthKey || monthKey.length < 7) return monthKey;
      const [year, month] = monthKey.split("-");
      return `${year} 年 ${month} 月`;
    }
    onMounted(() => {
      loadTimeline();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$b, [
        createBaseVNode("header", _hoisted_2$b, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "header-pre-badge" }, [
            createBaseVNode("span", { class: "badge-dot" }),
            createBaseVNode("span", { class: "badge-txt" }, "CHRONOLOGICAL STREAM // 全球演进时间线")
          ], -1)),
          _cache[3] || (_cache[3] = createBaseVNode("h1", { class: "page-title" }, "模型架构代际演进历程", -1)),
          createBaseVNode("p", _hoisted_3$b, " 按年份与月份全景梳理已核实的人工确认模型架构迭代、开源发布与版本里程碑演进节点（共收录 " + toDisplayString(events.value.length) + " 项已核实验进）。 ", 1),
          timelineGroups.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_4$b, [
            _cache[1] || (_cache[1] = createBaseVNode("span", { class: "jump-lbl" }, "月份快捷定位:", -1)),
            createBaseVNode("div", _hoisted_5$b, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(timelineGroups.value, (group) => {
                return openBlock(), createElementBlock("button", {
                  key: group.month,
                  class: "month-btn",
                  onClick: ($event) => scrollToMonth(group.month)
                }, toDisplayString(formatMonthLabel(group.month)) + " (" + toDisplayString(group.events.length) + ") ", 9, _hoisted_6$a);
              }), 128))
            ])
          ])) : createCommentVNode("", true)
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_7$a, [..._cache[4] || (_cache[4] = [
          createBaseVNode("div", { class: "loading-pulse-bar" }, null, -1),
          createBaseVNode("p", { class: "loading-tip" }, "正在同步已审计的演进时间线...", -1)
        ])])) : errorMsg.value ? (openBlock(), createElementBlock("div", _hoisted_8$a, [
          createBaseVNode("p", _hoisted_9$a, toDisplayString(errorMsg.value), 1),
          createBaseVNode("button", {
            class: "retry-btn",
            onClick: loadTimeline
          }, "重新加载时间线")
        ])) : timelineGroups.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_10$a, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(timelineGroups.value, (group) => {
            return openBlock(), createElementBlock("section", {
              id: `month-${group.month}`,
              key: group.month,
              class: "month-block"
            }, [
              createBaseVNode("div", {
                class: "month-header",
                onClick: ($event) => toggleMonth(group.month)
              }, [
                createBaseVNode("div", _hoisted_13$8, [
                  _cache[5] || (_cache[5] = createBaseVNode("span", { class: "month-bullet" }, null, -1)),
                  createBaseVNode("span", _hoisted_14$8, toDisplayString(formatMonthLabel(group.month)), 1),
                  createBaseVNode("span", _hoisted_15$8, toDisplayString(group.events.length) + " 项发布", 1)
                ]),
                createBaseVNode("button", _hoisted_16$7, toDisplayString(collapsedMonths.value.has(group.month) ? "+ 展开月份" : "- 收起月份"), 1)
              ], 8, _hoisted_12$9),
              withDirectives(createBaseVNode("div", _hoisted_17$7, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(group.events, (ev) => {
                  return openBlock(), createElementBlock("article", {
                    key: ev.id,
                    class: "timeline-card"
                  }, [
                    _cache[6] || (_cache[6] = createBaseVNode("div", { class: "timeline-axis-dot" }, null, -1)),
                    createBaseVNode("div", _hoisted_18$7, [
                      createBaseVNode("div", _hoisted_19$7, [
                        createBaseVNode("div", _hoisted_20$7, [
                          createBaseVNode("span", _hoisted_21$7, toDisplayString(formatDate(ev.releaseDate || ev.firstSeenAt)), 1),
                          ev.vendorSlug ? (openBlock(), createBlock(_component_router_link, {
                            key: 0,
                            to: `/vendors/${ev.vendorSlug}`,
                            class: "ev-vendor"
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("span", {
                                class: "brand-point",
                                style: normalizeStyle({ backgroundColor: ev.brandColor || "var(--obs-primary)" })
                              }, null, 4),
                              createBaseVNode("span", null, toDisplayString(ev.vendorName), 1)
                            ]),
                            _: 2
                          }, 1032, ["to"])) : createCommentVNode("", true)
                        ]),
                        createBaseVNode("span", {
                          class: "event-type-tag",
                          style: normalizeStyle({
                            color: getEventTypeBadge(ev.eventType).color,
                            backgroundColor: getEventTypeBadge(ev.eventType).bg
                          })
                        }, toDisplayString(getEventTypeBadge(ev.eventType).text), 5)
                      ]),
                      createBaseVNode("h3", _hoisted_22$7, [
                        ev.modelId ? (openBlock(), createBlock(_component_router_link, {
                          key: 0,
                          to: `/models/${ev.modelId}`,
                          class: "ev-model-link"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(ev.modelName), 1)
                          ]),
                          _: 2
                        }, 1032, ["to"])) : (openBlock(), createElementBlock("span", _hoisted_23$7, toDisplayString(ev.modelName), 1))
                      ]),
                      createBaseVNode("p", _hoisted_24$6, toDisplayString(ev.summary), 1),
                      createBaseVNode("div", _hoisted_25$6, [
                        createBaseVNode("div", _hoisted_26$6, [
                          ev.stage ? (openBlock(), createElementBlock("span", _hoisted_27$4, toDisplayString(ev.stage), 1)) : createCommentVNode("", true),
                          ev.availabilityStatus ? (openBlock(), createElementBlock("span", _hoisted_28$4, toDisplayString(ev.availabilityStatus), 1)) : createCommentVNode("", true)
                        ]),
                        ev.evidences && ev.evidences.length > 0 ? (openBlock(), createElementBlock("a", {
                          key: 0,
                          href: ev.evidences[0].officialUrl,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          class: "proof-anchor",
                          onClick: _cache[0] || (_cache[0] = withModifiers(() => {
                          }, ["stop"]))
                        }, [
                          createBaseVNode("span", null, "🔗 " + toDisplayString(ev.evidences[0].title || "官方原厂发布证据") + " ↗", 1)
                        ], 8, _hoisted_29$4)) : createCommentVNode("", true)
                      ])
                    ])
                  ]);
                }), 128))
              ], 512), [
                [vShow, !collapsedMonths.value.has(group.month)]
              ])
            ], 8, _hoisted_11$9);
          }), 128))
        ])) : (openBlock(), createElementBlock("div", _hoisted_30$4, [..._cache[7] || (_cache[7] = [
          createBaseVNode("p", null, "暂无已确认的模型演进历史记录", -1)
        ])]))
      ]);
    };
  }
};
const AiTimelineView = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-bc2b1c05"]]);
const articleApi = {
  // 读者端接口
  getArticles(params = {}) {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.tag) query.set("tag", params.tag);
    if (params.category) query.set("category", params.category);
    if (params.page) query.set("page", params.page);
    if (params.size) query.set("size", params.size);
    const qs = query.toString();
    return request(`/api/articles${qs ? "?" + qs : ""}`);
  },
  getArticleDetail(id) {
    return request(`/api/articles/${id}`);
  },
  getRecentArticles(limit = 5) {
    return request(`/api/articles/recent?limit=${limit}`);
  },
  getArchives() {
    return request("/api/articles/archives");
  },
  getCategories() {
    return request("/api/categories");
  },
  getTags() {
    return request("/api/tags");
  },
  // 管理端接口
  getAdminArticles(params = {}) {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.tag) query.set("tag", params.tag);
    if (params.category) query.set("category", params.category);
    if (params.page) query.set("page", params.page);
    if (params.size) query.set("size", params.size);
    const qs = query.toString();
    return request(`/api/admin/articles${qs ? "?" + qs : ""}`);
  },
  getAdminArticleDetail(id) {
    return request(`/api/admin/articles/${id}`);
  },
  createArticle(data) {
    return request("/api/admin/articles", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateArticle(id, data) {
    return request(`/api/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteArticle(id) {
    return request(`/api/admin/articles/${id}`, {
      method: "DELETE"
    });
  },
  getAdminStats() {
    return request("/api/admin/articles/stats");
  }
};
const workApi = {
  // 读者端
  getWorks() {
    return request("/api/works");
  },
  getWorkDetail(id) {
    return request(`/api/works/${id}`);
  },
  // 管理端
  createWork(data) {
    return request("/api/admin/works", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateWork(id, data) {
    return request(`/api/admin/works/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteWork(id) {
    return request(`/api/admin/works/${id}`, {
      method: "DELETE"
    });
  }
};
const _hoisted_1$a = { class: "home-page" };
const _hoisted_2$a = { class: "profile-hero" };
const _hoisted_3$a = { class: "hero-content" };
const _hoisted_4$a = { class: "hero-quick-nav" };
const _hoisted_5$a = {
  key: 0,
  class: "section-block"
};
const _hoisted_6$9 = { class: "section-header" };
const _hoisted_7$9 = {
  key: 0,
  class: "works-grid"
};
const _hoisted_8$9 = {
  key: 1,
  class: "works-grid"
};
const _hoisted_9$9 = { class: "work-header-row" };
const _hoisted_10$9 = { class: "work-name" };
const _hoisted_11$8 = { class: "work-summary" };
const _hoisted_12$8 = {
  key: 0,
  class: "work-tags"
};
const _hoisted_13$7 = { class: "work-actions" };
const _hoisted_14$7 = ["href"];
const _hoisted_15$7 = ["href"];
const _hoisted_16$6 = { class: "section-block" };
const _hoisted_17$6 = { class: "section-header" };
const _hoisted_18$6 = {
  key: 0,
  class: "article-skeleton-list"
};
const _hoisted_19$6 = {
  key: 1,
  class: "articles-clean-list"
};
const _hoisted_20$6 = { class: "article-item-header" };
const _hoisted_21$6 = { class: "article-title" };
const _hoisted_22$6 = { class: "article-meta-side" };
const _hoisted_23$6 = { class: "meta-date" };
const _hoisted_24$5 = {
  key: 0,
  class: "meta-cat"
};
const _hoisted_25$5 = { class: "article-summary" };
const _hoisted_26$5 = {
  key: 2,
  class: "empty-hint"
};
const _sfc_main$a = {
  __name: "AboutView",
  setup(__props) {
    const recentArticles = /* @__PURE__ */ ref([]);
    const featuredWorks = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    onMounted(async () => {
      try {
        const [articles, works] = await Promise.all([
          articleApi.getRecentArticles(5).catch(() => []),
          workApi.getWorks().catch(() => [])
        ]);
        recentArticles.value = articles || [];
        featuredWorks.value = (works || []).slice(0, 3);
      } finally {
        loading.value = false;
      }
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$a, [
        createBaseVNode("section", _hoisted_2$a, [
          createBaseVNode("div", _hoisted_3$a, [
            _cache[4] || (_cache[4] = createBaseVNode("h1", { class: "hero-title" }, "Simon", -1)),
            _cache[5] || (_cache[5] = createBaseVNode("p", { class: "hero-subline" }, "写写后端与前端", -1)),
            _cache[6] || (_cache[6] = createBaseVNode("p", { class: "hero-desc" }, " 平时在这里记点排错笔记、技术折腾手记与零碎心得，也放几个自己做的小工具。偏爱简单、克制且长久可用的软件设计。 ", -1)),
            createBaseVNode("div", _hoisted_4$a, [
              createVNode(_component_router_link, {
                to: "/articles",
                class: "quick-link"
              }, {
                default: withCtx(() => [..._cache[0] || (_cache[0] = [
                  createTextVNode("全部文章 →", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_router_link, {
                to: "/works",
                class: "quick-link"
              }, {
                default: withCtx(() => [..._cache[1] || (_cache[1] = [
                  createTextVNode("开源与作品 →", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_router_link, {
                to: "/archives",
                class: "quick-link"
              }, {
                default: withCtx(() => [..._cache[2] || (_cache[2] = [
                  createTextVNode("归档 →", -1)
                ])]),
                _: 1
              }),
              _cache[3] || (_cache[3] = createBaseVNode("a", {
                href: "https://github.com",
                target: "_blank",
                class: "quick-link ext"
              }, "GitHub ↗", -1))
            ])
          ])
        ]),
        featuredWorks.value.length > 0 || loading.value ? (openBlock(), createElementBlock("section", _hoisted_5$a, [
          createBaseVNode("div", _hoisted_6$9, [
            _cache[8] || (_cache[8] = createBaseVNode("div", { class: "header-left" }, [
              createBaseVNode("h2", { class: "section-title" }, "开源与作品"),
              createBaseVNode("span", { class: "section-subtitle" }, "平时折腾的一些小项目与工具")
            ], -1)),
            createVNode(_component_router_link, {
              to: "/works",
              class: "section-more"
            }, {
              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                createTextVNode("全部作品 →", -1)
              ])]),
              _: 1
            })
          ]),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_7$9, [
            (openBlock(), createElementBlock(Fragment, null, renderList(3, (i) => {
              return createBaseVNode("div", {
                key: i,
                class: "skeleton-card"
              });
            }), 64))
          ])) : (openBlock(), createElementBlock("div", _hoisted_8$9, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(featuredWorks.value, (work) => {
              return openBlock(), createElementBlock("div", {
                key: work.id,
                class: "work-card"
              }, [
                createBaseVNode("div", _hoisted_9$9, [
                  createBaseVNode("h3", _hoisted_10$9, toDisplayString(work.title), 1)
                ]),
                createBaseVNode("p", _hoisted_11$8, toDisplayString(work.description), 1),
                work.techStack && work.techStack.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12$8, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(work.techStack, (tag) => {
                    return openBlock(), createElementBlock("span", {
                      key: tag,
                      class: "tech-tag"
                    }, toDisplayString(tag), 1);
                  }), 128))
                ])) : createCommentVNode("", true),
                createBaseVNode("div", _hoisted_13$7, [
                  work.demoUrl ? (openBlock(), createElementBlock("a", {
                    key: 0,
                    href: work.demoUrl,
                    target: "_blank",
                    class: "work-btn-link primary"
                  }, " 在线预览 ↗ ", 8, _hoisted_14$7)) : createCommentVNode("", true),
                  work.githubUrl ? (openBlock(), createElementBlock("a", {
                    key: 1,
                    href: work.githubUrl,
                    target: "_blank",
                    class: "work-btn-link"
                  }, " GitHub 源码 ", 8, _hoisted_15$7)) : createCommentVNode("", true)
                ])
              ]);
            }), 128))
          ]))
        ])) : createCommentVNode("", true),
        createBaseVNode("section", _hoisted_16$6, [
          createBaseVNode("div", _hoisted_17$6, [
            _cache[10] || (_cache[10] = createBaseVNode("div", { class: "header-left" }, [
              createBaseVNode("h2", { class: "section-title" }, "最新手记"),
              createBaseVNode("span", { class: "section-subtitle" }, "近期整理的踩坑记录与随笔")
            ], -1)),
            createVNode(_component_router_link, {
              to: "/articles",
              class: "section-more"
            }, {
              default: withCtx(() => [..._cache[9] || (_cache[9] = [
                createTextVNode("查看全部 →", -1)
              ])]),
              _: 1
            })
          ]),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_18$6, [
            (openBlock(), createElementBlock(Fragment, null, renderList(3, (i) => {
              return createBaseVNode("div", {
                key: i,
                class: "article-skeleton-row"
              });
            }), 64))
          ])) : recentArticles.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_19$6, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(recentArticles.value, (art) => {
              return openBlock(), createElementBlock("article", {
                key: art.id,
                class: "article-item"
              }, [
                createBaseVNode("div", _hoisted_20$6, [
                  createBaseVNode("h3", _hoisted_21$6, [
                    createVNode(_component_router_link, {
                      to: `/articles/${art.id}`
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(art.title), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  createBaseVNode("div", _hoisted_22$6, [
                    createBaseVNode("span", _hoisted_23$6, toDisplayString((art.createdAt || "").slice(0, 10)), 1),
                    art.category ? (openBlock(), createElementBlock("span", _hoisted_24$5, toDisplayString(art.category), 1)) : createCommentVNode("", true)
                  ])
                ]),
                createBaseVNode("p", _hoisted_25$5, toDisplayString(art.summary), 1)
              ]);
            }), 128))
          ])) : (openBlock(), createElementBlock("div", _hoisted_26$5, " 暂无文章，写点什么吧。 "))
        ])
      ]);
    };
  }
};
const AboutView = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-0ebda956"]]);
const _hoisted_1$9 = {
  key: 0,
  class: "pagination-container"
};
const _hoisted_2$9 = ["disabled"];
const _hoisted_3$9 = { class: "page-numbers" };
const _hoisted_4$9 = ["onClick"];
const _hoisted_5$9 = ["disabled"];
const _sfc_main$9 = {
  __name: "Pagination",
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    function changePage(p2) {
      if (p2 >= 1 && p2 <= props.totalPages && p2 !== props.currentPage) {
        emit2("change", p2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    return (_ctx, _cache) => {
      return __props.totalPages > 1 ? (openBlock(), createElementBlock("div", _hoisted_1$9, [
        createBaseVNode("button", {
          class: "page-btn",
          disabled: __props.currentPage <= 1,
          onClick: _cache[0] || (_cache[0] = ($event) => changePage(__props.currentPage - 1))
        }, " 上一页 ", 8, _hoisted_2$9),
        createBaseVNode("div", _hoisted_3$9, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.totalPages, (p2) => {
            return openBlock(), createElementBlock("button", {
              key: p2,
              class: normalizeClass(["page-num-btn", { active: p2 === __props.currentPage }]),
              onClick: ($event) => changePage(p2)
            }, toDisplayString(p2), 11, _hoisted_4$9);
          }), 128))
        ]),
        createBaseVNode("button", {
          class: "page-btn",
          disabled: __props.currentPage >= __props.totalPages,
          onClick: _cache[1] || (_cache[1] = ($event) => changePage(__props.currentPage + 1))
        }, " 下一页 ", 8, _hoisted_5$9)
      ])) : createCommentVNode("", true);
    };
  }
};
const Pagination = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-624e1720"]]);
const _hoisted_1$8 = { class: "articles-page" };
const _hoisted_2$8 = { class: "articles-top-banner" };
const _hoisted_3$8 = { class: "banner-title-wrap" };
const _hoisted_4$8 = { class: "page-desc" };
const _hoisted_5$8 = { class: "search-form-wrap" };
const _hoisted_6$8 = { class: "search-input-box" };
const _hoisted_7$8 = { class: "filter-pure-bar" };
const _hoisted_8$8 = { class: "categories-list" };
const _hoisted_9$8 = ["onClick"];
const _hoisted_10$8 = { class: "badge-num" };
const _hoisted_11$7 = {
  key: 0,
  class: "filter-reset-wrap"
};
const _hoisted_12$7 = {
  key: 0,
  class: "filter-chip"
};
const _hoisted_13$6 = {
  key: 1,
  class: "filter-chip"
};
const _hoisted_14$6 = {
  key: 2,
  class: "filter-chip"
};
const _hoisted_15$6 = {
  key: 0,
  class: "articles-skeleton-list"
};
const _hoisted_16$5 = {
  key: 1,
  class: "empty-state-box"
};
const _hoisted_17$5 = {
  key: 2,
  class: "refined-articles-stream"
};
const _hoisted_18$5 = { class: "item-main-row" };
const _hoisted_19$5 = { class: "stream-item-title" };
const _hoisted_20$5 = { class: "stream-item-meta" };
const _hoisted_21$5 = { class: "stream-date" };
const _hoisted_22$5 = {
  key: 0,
  class: "stream-cat"
};
const _hoisted_23$5 = { class: "stream-item-summary" };
const _sfc_main$8 = {
  __name: "ArticlesView",
  setup(__props) {
    const route = useRoute();
    const articles = /* @__PURE__ */ ref([]);
    const total = /* @__PURE__ */ ref(0);
    const page = /* @__PURE__ */ ref(1);
    const size = /* @__PURE__ */ ref(6);
    const totalPages = /* @__PURE__ */ ref(1);
    const loading = /* @__PURE__ */ ref(false);
    const searchKeyword = /* @__PURE__ */ ref("");
    const selectedCategory = /* @__PURE__ */ ref("");
    const selectedTag = /* @__PURE__ */ ref("");
    const categories = /* @__PURE__ */ ref({});
    const tags = /* @__PURE__ */ ref({});
    async function fetchMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          articleApi.getCategories().catch(() => ({})),
          articleApi.getTags().catch(() => ({}))
        ]);
        categories.value = catRes || {};
        tags.value = tagRes || {};
      } catch (e) {
        console.error("加载分类/标签失败", e);
      }
    }
    async function loadArticles() {
      loading.value = true;
      try {
        const res = await articleApi.getArticles({
          page: page.value,
          size: size.value,
          keyword: searchKeyword.value,
          category: selectedCategory.value,
          tag: selectedTag.value
        });
        articles.value = res.list || [];
        total.value = res.total || 0;
        totalPages.value = res.totalPages || 1;
      } catch (e) {
        console.error("加载文章列表失败", e);
      } finally {
        loading.value = false;
      }
    }
    function handleSearch() {
      page.value = 1;
      loadArticles();
    }
    function selectCategory(cat) {
      selectedCategory.value = selectedCategory.value === cat ? "" : cat;
      page.value = 1;
      loadArticles();
    }
    function handlePageChange(p2) {
      page.value = p2;
      loadArticles();
    }
    function clearFilters() {
      searchKeyword.value = "";
      selectedCategory.value = "";
      selectedTag.value = "";
      page.value = 1;
      loadArticles();
    }
    onMounted(() => {
      if (route.query.tag) selectedTag.value = route.query.tag;
      if (route.query.category) selectedCategory.value = route.query.category;
      fetchMeta();
      loadArticles();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
        createBaseVNode("div", _hoisted_2$8, [
          createBaseVNode("div", _hoisted_3$8, [
            _cache[3] || (_cache[3] = createBaseVNode("h1", { class: "page-title" }, "全部手记", -1)),
            createBaseVNode("p", _hoisted_4$8, "平时记录的排错日志、架构笔记与折腾心得（共 " + toDisplayString(total.value) + " 篇）", 1)
          ]),
          createBaseVNode("div", _hoisted_5$8, [
            createBaseVNode("div", _hoisted_6$8, [
              _cache[4] || (_cache[4] = createBaseVNode("span", { class: "search-icon" }, "🔍", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
                type: "text",
                placeholder: "搜索文章标题或关键词...",
                class: "search-input",
                onKeyup: withKeys(handleSearch, ["enter"])
              }, null, 544), [
                [vModelText, searchKeyword.value]
              ]),
              searchKeyword.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "clear-btn",
                onClick: _cache[1] || (_cache[1] = ($event) => {
                  searchKeyword.value = "";
                  handleSearch();
                })
              }, "✕")) : createCommentVNode("", true)
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_7$8, [
          createBaseVNode("div", _hoisted_8$8, [
            createBaseVNode("button", {
              class: normalizeClass(["category-pure-btn", { active: !selectedCategory.value }]),
              onClick: _cache[2] || (_cache[2] = ($event) => selectCategory(""))
            }, " 全部 (" + toDisplayString(total.value) + ") ", 3),
            (openBlock(true), createElementBlock(Fragment, null, renderList(categories.value, (count, cat) => {
              return openBlock(), createElementBlock("button", {
                key: cat,
                class: normalizeClass(["category-pure-btn", { active: selectedCategory.value === cat }]),
                onClick: ($event) => selectCategory(cat)
              }, [
                createTextVNode(toDisplayString(cat) + " ", 1),
                createBaseVNode("span", _hoisted_10$8, "(" + toDisplayString(count) + ")", 1)
              ], 10, _hoisted_9$8);
            }), 128))
          ]),
          selectedCategory.value || selectedTag.value || searchKeyword.value ? (openBlock(), createElementBlock("div", _hoisted_11$7, [
            selectedCategory.value ? (openBlock(), createElementBlock("span", _hoisted_12$7, "分类: " + toDisplayString(selectedCategory.value), 1)) : createCommentVNode("", true),
            selectedTag.value ? (openBlock(), createElementBlock("span", _hoisted_13$6, "标签: " + toDisplayString(selectedTag.value), 1)) : createCommentVNode("", true),
            searchKeyword.value ? (openBlock(), createElementBlock("span", _hoisted_14$6, "搜索: " + toDisplayString(searchKeyword.value), 1)) : createCommentVNode("", true),
            createBaseVNode("button", {
              class: "btn-clear-link",
              onClick: clearFilters
            }, "清空过滤")
          ])) : createCommentVNode("", true)
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_15$6, [
          (openBlock(), createElementBlock(Fragment, null, renderList(3, (i) => {
            return createBaseVNode("div", {
              class: "skeleton-card-row",
              key: i
            });
          }), 64))
        ])) : articles.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_16$5, [
          _cache[5] || (_cache[5] = createBaseVNode("p", { class: "empty-title" }, "未找到相关手记", -1)),
          createBaseVNode("button", {
            class: "btn-reset-filters",
            onClick: clearFilters
          }, "查看全部手记")
        ])) : (openBlock(), createElementBlock("div", _hoisted_17$5, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(articles.value, (item) => {
            return openBlock(), createElementBlock("article", {
              key: item.id,
              class: "stream-article-item"
            }, [
              createBaseVNode("div", _hoisted_18$5, [
                createBaseVNode("h2", _hoisted_19$5, [
                  createVNode(_component_router_link, {
                    to: `/articles/${item.id}`
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(item.title), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ]),
                createBaseVNode("div", _hoisted_20$5, [
                  createBaseVNode("span", _hoisted_21$5, toDisplayString((item.createdAt || "").slice(0, 10)), 1),
                  item.category ? (openBlock(), createElementBlock("span", _hoisted_22$5, toDisplayString(item.category), 1)) : createCommentVNode("", true)
                ])
              ]),
              createBaseVNode("p", _hoisted_23$5, toDisplayString(item.summary), 1)
            ]);
          }), 128))
        ])),
        createVNode(Pagination, {
          "current-page": page.value,
          "total-pages": totalPages.value,
          onChange: handlePageChange
        }, null, 8, ["current-page", "total-pages"])
      ]);
    };
  }
};
const ArticlesView = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-8b3b56c8"]]);
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function extractHeadings(md) {
  if (!md) return [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const headings = [];
  let inCode = false;
  let index = 0;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = line.match(/^(#{1,4})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_~`]/g, "");
      const id = `heading-${index++}-${cleanText.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "")}`;
      headings.push({ id, text: cleanText, level });
    }
  }
  return headings;
}
function renderMarkdown(md) {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeBuffer = [];
  let inList = false;
  let listType = null;
  let inTable = false;
  let headingIndex = 0;
  const closeList = () => {
    if (inList) {
      output.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
      listType = null;
    }
  };
  const closeTable = () => {
    if (inTable) {
      output.push("</tbody></table></div>");
      inTable = false;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        closeTable();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim() || "text";
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeContent = escapeHtml(codeBuffer.join("\n"));
        const codeId = "code-" + Math.random().toString(36).substr(2, 9);
        output.push(`
          <div class="code-block-wrapper mac-style">
            <div class="code-block-header">
              <div class="mac-window-dots">
                <span class="mac-dot red"></span>
                <span class="mac-dot yellow"></span>
                <span class="mac-dot green"></span>
              </div>
              <span class="code-lang-tag">${escapeHtml(codeLang)}</span>
              <button class="copy-code-btn" onclick="navigator.clipboard.writeText(document.getElementById('${codeId}').innerText).then(() => { this.innerText = '已复制!'; this.classList.add('copied'); setTimeout(() => { this.innerText = '复制'; this.classList.remove('copied'); }, 2000); })">复制</button>
            </div>
            <pre><code id="${codeId}" class="language-${escapeHtml(codeLang)}">${codeContent}</code></pre>
          </div>
        `);
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      closeTable();
      continue;
    }
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeList();
      const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());
      const isDivider = cells.every((c) => /^:?-+:?$/.test(c));
      if (isDivider) {
        continue;
      }
      if (!inTable) {
        inTable = true;
        output.push('<div class="table-container"><table class="markdown-table"><thead><tr>');
        for (const cell of cells) {
          output.push(`<th>${formatInline(cell)}</th>`);
        }
        output.push("</tr></thead><tbody>");
      } else {
        output.push("<tr>");
        for (const cell of cells) {
          output.push(`<td>${formatInline(cell)}</td>`);
        }
        output.push("</tr>");
      }
      continue;
    } else {
      closeTable();
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      const cleanContent = content.replace(/[*_~`]/g, "");
      const id = `heading-${headingIndex++}-${cleanContent.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "")}`;
      output.push(`<h${level} id="${id}" class="heading-anchor"><span class="heading-hash">#</span> ${formatInline(content)}</h${level}>`);
      continue;
    }
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      closeList();
      output.push('<hr class="markdown-divider" />');
      continue;
    }
    if (line.startsWith(">")) {
      closeList();
      const quoteText = line.replace(/^>\s?/, "");
      output.push(`<blockquote>${formatInline(quoteText)}</blockquote>`);
      continue;
    }
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      const isUl = Boolean(ulMatch);
      const content = isUl ? ulMatch[2] : olMatch[2];
      if (!inList || (isUl ? listType !== "ul" : listType !== "ol")) {
        closeList();
        inList = true;
        listType = isUl ? "ul" : "ol";
        output.push(isUl ? '<ul class="markdown-list">' : '<ol class="markdown-list">');
      }
      output.push(`<li>${formatInline(content)}</li>`);
      continue;
    } else {
      closeList();
    }
    output.push(`<p>${formatInline(line)}</p>`);
  }
  closeList();
  closeTable();
  return output.join("\n");
}
function formatInline(text) {
  if (!text) return "";
  let res = escapeHtml(text);
  res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="markdown-img" src="$2" alt="$1" loading="lazy" />');
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  res = res.replace(/\*(.*?)\*/g, "<em>$1</em>");
  res = res.replace(/~~(.*?)~~/g, "<del>$1</del>");
  res = res.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return res;
}
function calculateReadingStats(content) {
  if (!content) return { words: 0, readMinutes: 1 };
  const clean = content.replace(/```[\s\S]*?```/g, "").replace(/[#*`~>[\]()!-]/g, "");
  const chineseCount = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (clean.match(/[a-zA-Z0-9_-]+/g) || []).length;
  const totalWords = chineseCount + englishWords;
  const readMinutes = Math.max(1, Math.ceil(totalWords / 300));
  return { words: totalWords, readMinutes };
}
const _hoisted_1$7 = { class: "article-detail-view" };
const _hoisted_2$7 = { class: "top-nav-bar" };
const _hoisted_3$7 = { class: "breadcrumb-trail" };
const _hoisted_4$7 = { class: "trail-current" };
const _hoisted_5$7 = {
  key: 0,
  class: "detail-loading-box"
};
const _hoisted_6$7 = {
  key: 1,
  class: "detail-error-box"
};
const _hoisted_7$7 = { class: "error-text" };
const _hoisted_8$7 = {
  key: 2,
  class: "detail-layout-grid"
};
const _hoisted_9$7 = { class: "article-main-card" };
const _hoisted_10$7 = {
  key: 0,
  class: "detail-hero-cover"
};
const _hoisted_11$6 = ["src", "alt"];
const _hoisted_12$6 = { class: "post-header" };
const _hoisted_13$5 = { class: "post-meta-clean" };
const _hoisted_14$5 = { class: "post-date" };
const _hoisted_15$5 = { class: "post-read-time" };
const _hoisted_16$4 = { class: "post-views" };
const _hoisted_17$4 = {
  key: 0,
  class: "meta-dot"
};
const _hoisted_18$4 = {
  key: 1,
  class: "post-cat"
};
const _hoisted_19$4 = { class: "post-title" };
const _hoisted_20$4 = {
  key: 0,
  class: "post-summary-quote"
};
const _hoisted_21$4 = ["innerHTML"];
const _hoisted_22$4 = { class: "article-toc-aside" };
const _hoisted_23$4 = { class: "toc-sticky-card" };
const _hoisted_24$4 = {
  key: 0,
  class: "toc-empty"
};
const _hoisted_25$4 = {
  key: 1,
  class: "toc-nav-list"
};
const _hoisted_26$4 = ["href", "onClick"];
const _sfc_main$7 = {
  __name: "ArticleDetailView",
  setup(__props) {
    const route = useRoute();
    const router2 = useRouter();
    const article = /* @__PURE__ */ ref(null);
    const loading = /* @__PURE__ */ ref(true);
    const error = /* @__PURE__ */ ref(null);
    const activeHeadingId = /* @__PURE__ */ ref("");
    const showBackToTop = /* @__PURE__ */ ref(false);
    const renderedContent = computed(() => {
      if (!article.value || !article.value.contentMd) return "";
      return renderMarkdown(article.value.contentMd);
    });
    const stats = computed(() => {
      if (!article.value || !article.value.contentMd) return { words: 0, readMinutes: 1 };
      return calculateReadingStats(article.value.contentMd);
    });
    const headings = computed(() => {
      if (!article.value || !article.value.contentMd) return [];
      return extractHeadings(article.value.contentMd);
    });
    function scrollToHeading(id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        activeHeadingId.value = id;
      }
    }
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      showBackToTop.value = scrollTop > 300;
      if (headings.value.length === 0) return;
      for (let i = headings.value.length - 1; i >= 0; i--) {
        const h2 = headings.value[i];
        const el = document.getElementById(h2.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 120) {
            activeHeadingId.value = h2.id;
            break;
          }
        }
      }
    }
    async function fetchDetail() {
      const id = route.params.id;
      if (!id) {
        error.value = "未指定文章 ID";
        loading.value = false;
        return;
      }
      loading.value = true;
      try {
        const res = await articleApi.getArticleDetail(id);
        article.value = res;
      } catch (err) {
        error.value = err.message || "获取文章详情失败";
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      fetchDetail();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.addEventListener("scroll", handleScroll, { passive: true });
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createBaseVNode("div", _hoisted_2$7, [
          createBaseVNode("button", {
            class: "back-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => unref(router2).back())
          }, " ← 返回上一页 "),
          createBaseVNode("div", _hoisted_3$7, [
            createVNode(_component_router_link, { to: "/" }, {
              default: withCtx(() => [..._cache[1] || (_cache[1] = [
                createTextVNode("首页", -1)
              ])]),
              _: 1
            }),
            _cache[3] || (_cache[3] = createBaseVNode("span", { class: "trail-sep" }, "/", -1)),
            createVNode(_component_router_link, { to: "/articles" }, {
              default: withCtx(() => [..._cache[2] || (_cache[2] = [
                createTextVNode("文章列表", -1)
              ])]),
              _: 1
            }),
            _cache[4] || (_cache[4] = createBaseVNode("span", { class: "trail-sep" }, "/", -1)),
            createBaseVNode("span", _hoisted_4$7, toDisplayString(article.value ? article.value.title : "正文"), 1)
          ])
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_5$7, [
          _cache[5] || (_cache[5] = createBaseVNode("div", { class: "skeleton-header-box" }, null, -1)),
          (openBlock(), createElementBlock(Fragment, null, renderList(4, (i) => {
            return createBaseVNode("div", {
              class: "skeleton-body-box",
              key: i
            });
          }), 64))
        ])) : error.value ? (openBlock(), createElementBlock("div", _hoisted_6$7, [
          _cache[6] || (_cache[6] = createBaseVNode("div", { class: "error-emoji" }, "⚠️", -1)),
          createBaseVNode("p", _hoisted_7$7, toDisplayString(error.value), 1),
          createBaseVNode("button", {
            class: "btn-retry",
            onClick: fetchDetail
          }, "重新加载")
        ])) : article.value ? (openBlock(), createElementBlock("div", _hoisted_8$7, [
          createBaseVNode("article", _hoisted_9$7, [
            article.value.coverUrl ? (openBlock(), createElementBlock("div", _hoisted_10$7, [
              createBaseVNode("img", {
                src: article.value.coverUrl,
                alt: article.value.title
              }, null, 8, _hoisted_11$6)
            ])) : createCommentVNode("", true),
            createBaseVNode("header", _hoisted_12$6, [
              createBaseVNode("div", _hoisted_13$5, [
                createBaseVNode("span", _hoisted_14$5, toDisplayString((article.value.createdAt || "").slice(0, 10)), 1),
                _cache[7] || (_cache[7] = createBaseVNode("span", { class: "meta-dot" }, "·", -1)),
                createBaseVNode("span", _hoisted_15$5, "约 " + toDisplayString(stats.value.readMinutes) + " 分钟阅读", 1),
                _cache[8] || (_cache[8] = createBaseVNode("span", { class: "meta-dot" }, "·", -1)),
                createBaseVNode("span", _hoisted_16$4, toDisplayString(article.value.views || 0) + " 次阅读", 1),
                article.value.category ? (openBlock(), createElementBlock("span", _hoisted_17$4, "·")) : createCommentVNode("", true),
                article.value.category ? (openBlock(), createElementBlock("span", _hoisted_18$4, toDisplayString(article.value.category), 1)) : createCommentVNode("", true)
              ]),
              createBaseVNode("h1", _hoisted_19$4, toDisplayString(article.value.title), 1),
              article.value.summary ? (openBlock(), createElementBlock("p", _hoisted_20$4, toDisplayString(article.value.summary), 1)) : createCommentVNode("", true)
            ]),
            _cache[9] || (_cache[9] = createBaseVNode("div", { class: "post-divider" }, null, -1)),
            createBaseVNode("div", {
              class: "markdown-body",
              innerHTML: renderedContent.value
            }, null, 8, _hoisted_21$4),
            _cache[10] || (_cache[10] = createBaseVNode("footer", { class: "post-footer" }, [
              createBaseVNode("div", { class: "copyright-card" }, [
                createBaseVNode("p", { class: "copyright-text" }, [
                  createTextVNode(" 许可协议："),
                  createBaseVNode("a", {
                    href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
                    target: "_blank"
                  }, "CC BY-NC-SA 4.0"),
                  createTextVNode("，转载请保留出处。 ")
                ])
              ])
            ], -1))
          ]),
          createBaseVNode("aside", _hoisted_22$4, [
            createBaseVNode("div", _hoisted_23$4, [
              _cache[11] || (_cache[11] = createBaseVNode("div", { class: "toc-title" }, [
                createBaseVNode("span", null, "目录")
              ], -1)),
              headings.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_24$4, " 当前文章未包含子标题 ")) : (openBlock(), createElementBlock("nav", _hoisted_25$4, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(headings.value, (h2) => {
                  return openBlock(), createElementBlock("a", {
                    key: h2.id,
                    href: `#${h2.id}`,
                    class: normalizeClass([
                      "toc-link",
                      `level-${h2.level}`,
                      { active: activeHeadingId.value === h2.id }
                    ]),
                    onClick: withModifiers(($event) => scrollToHeading(h2.id), ["prevent"])
                  }, toDisplayString(h2.text), 11, _hoisted_26$4);
                }), 128))
              ])),
              createBaseVNode("div", { class: "toc-quick-actions" }, [
                createBaseVNode("button", {
                  class: "quick-top-btn",
                  onClick: scrollToTop
                }, " ↑ 回到顶部 ")
              ])
            ])
          ])
        ])) : createCommentVNode("", true),
        createVNode(Transition, { name: "fade" }, {
          default: withCtx(() => [
            showBackToTop.value ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "floating-back-top",
              title: "回到页面顶部",
              onClick: scrollToTop
            }, " ▲ ")) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
};
const ArticleDetailView = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-56193544"]]);
const _hoisted_1$6 = { class: "works-page" };
const _hoisted_2$6 = { class: "works-header-banner" };
const _hoisted_3$6 = {
  key: 0,
  class: "tech-filter-bar"
};
const _hoisted_4$6 = ["onClick"];
const _hoisted_5$6 = {
  key: 0,
  class: "works-skeleton-grid"
};
const _hoisted_6$6 = {
  key: 1,
  class: "empty-gallery-box"
};
const _hoisted_7$6 = {
  key: 2,
  class: "works-card-grid"
};
const _hoisted_8$6 = { class: "card-details-box" };
const _hoisted_9$6 = { class: "project-header-row" };
const _hoisted_10$6 = { class: "project-title" };
const _hoisted_11$5 = { class: "project-narrative" };
const _hoisted_12$5 = {
  key: 0,
  class: "tech-chips-wrapper"
};
const _hoisted_13$4 = { class: "project-action-buttons" };
const _hoisted_14$4 = ["href"];
const _hoisted_15$4 = ["href"];
const _sfc_main$6 = {
  __name: "WorksView",
  setup(__props) {
    const works = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    const activeTechFilter = /* @__PURE__ */ ref("");
    async function loadWorks() {
      loading.value = true;
      try {
        const list = await workApi.getWorks();
        works.value = list || [];
      } catch (e) {
        console.error("加载作品列表异常", e);
      } finally {
        loading.value = false;
      }
    }
    const allTechs = computed(() => {
      const set = /* @__PURE__ */ new Set();
      works.value.forEach((w) => {
        (w.techStack || []).forEach((t) => set.add(t));
      });
      return Array.from(set);
    });
    const filteredWorks = computed(() => {
      if (!activeTechFilter.value) return works.value;
      return works.value.filter(
        (w) => (w.techStack || []).some((t) => t.toLowerCase() === activeTechFilter.value.toLowerCase())
      );
    });
    onMounted(() => {
      loadWorks();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$6, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "header-texts" }, [
            createBaseVNode("h1", { class: "page-title" }, "开源与作品"),
            createBaseVNode("p", { class: "page-desc" }, " 平时折腾的一些独立工具、小脚本与实战 Demo。 ")
          ], -1)),
          allTechs.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_3$6, [
            createBaseVNode("button", {
              class: normalizeClass(["filter-pill", { active: !activeTechFilter.value }]),
              onClick: _cache[0] || (_cache[0] = ($event) => activeTechFilter.value = "")
            }, " 全部 (" + toDisplayString(works.value.length) + ") ", 3),
            (openBlock(true), createElementBlock(Fragment, null, renderList(allTechs.value, (tech) => {
              return openBlock(), createElementBlock("button", {
                key: tech,
                class: normalizeClass(["filter-pill", { active: activeTechFilter.value === tech }]),
                onClick: ($event) => activeTechFilter.value = activeTechFilter.value === tech ? "" : tech
              }, toDisplayString(tech), 11, _hoisted_4$6);
            }), 128))
          ])) : createCommentVNode("", true)
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_5$6, [
          (openBlock(), createElementBlock(Fragment, null, renderList(3, (i) => {
            return createBaseVNode("div", {
              class: "skeleton-card-item",
              key: i
            });
          }), 64))
        ])) : filteredWorks.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_6$6, [
          _cache[3] || (_cache[3] = createBaseVNode("div", { class: "empty-icon-box" }, "📦", -1)),
          _cache[4] || (_cache[4] = createBaseVNode("h3", null, "暂未检索到相关项目", -1)),
          createBaseVNode("button", {
            class: "reset-tech-btn",
            onClick: _cache[1] || (_cache[1] = ($event) => activeTechFilter.value = "")
          }, "查看全部项目")
        ])) : (openBlock(), createElementBlock("div", _hoisted_7$6, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(filteredWorks.value, (work) => {
            return openBlock(), createElementBlock("div", {
              key: work.id,
              class: "project-clean-card"
            }, [
              createBaseVNode("div", _hoisted_8$6, [
                createBaseVNode("div", _hoisted_9$6, [
                  createBaseVNode("h2", _hoisted_10$6, toDisplayString(work.title), 1)
                ]),
                createBaseVNode("p", _hoisted_11$5, toDisplayString(work.description), 1),
                work.techStack && work.techStack.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12$5, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(work.techStack, (t) => {
                    return openBlock(), createElementBlock("span", {
                      key: t,
                      class: "tech-tag-chip"
                    }, toDisplayString(t), 1);
                  }), 128))
                ])) : createCommentVNode("", true),
                createBaseVNode("div", _hoisted_13$4, [
                  work.demoUrl ? (openBlock(), createElementBlock("a", {
                    key: 0,
                    href: work.demoUrl,
                    target: "_blank",
                    class: "action-btn-demo"
                  }, " 在线预览 ↗ ", 8, _hoisted_14$4)) : createCommentVNode("", true),
                  work.githubUrl ? (openBlock(), createElementBlock("a", {
                    key: 1,
                    href: work.githubUrl,
                    target: "_blank",
                    class: "action-btn-github"
                  }, " GitHub 源码 ", 8, _hoisted_15$4)) : createCommentVNode("", true)
                ])
              ])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
};
const WorksView = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-09381797"]]);
const _hoisted_1$5 = { class: "archive-page" };
const _hoisted_2$5 = { class: "archive-header" };
const _hoisted_3$5 = { class: "page-desc" };
const _hoisted_4$5 = {
  key: 0,
  class: "archive-loading"
};
const _hoisted_5$5 = {
  key: 1,
  class: "empty-archive"
};
const _hoisted_6$5 = {
  key: 2,
  class: "timeline-container"
};
const _hoisted_7$5 = { class: "year-heading" };
const _hoisted_8$5 = { class: "year-badge" };
const _hoisted_9$5 = { class: "year-count" };
const _hoisted_10$5 = { class: "timeline-list" };
const _hoisted_11$4 = { class: "timeline-date" };
const _hoisted_12$4 = {
  key: 0,
  class: "timeline-cat"
};
const _sfc_main$5 = {
  __name: "ArchiveView",
  setup(__props) {
    const archives = /* @__PURE__ */ ref({});
    const loading = /* @__PURE__ */ ref(true);
    const totalCount = computed(() => {
      let count = 0;
      for (const year in archives.value) {
        count += (archives.value[year] || []).length;
      }
      return count;
    });
    async function loadArchives() {
      loading.value = true;
      try {
        const res = await articleApi.getArchives();
        archives.value = res || {};
      } catch (e) {
        console.error("加载归档异常", e);
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      loadArchives();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("div", _hoisted_2$5, [
          _cache[0] || (_cache[0] = createBaseVNode("h1", { class: "page-title" }, "时间线归档", -1)),
          createBaseVNode("p", _hoisted_3$5, "历史博文时间轴，共收录 " + toDisplayString(totalCount.value) + " 篇技术印记", 1)
        ]),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_4$5, [
          (openBlock(), createElementBlock(Fragment, null, renderList(3, (i) => {
            return createBaseVNode("div", {
              class: "skeleton-timeline",
              key: i
            });
          }), 64))
        ])) : Object.keys(archives.value).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_5$5, [..._cache[1] || (_cache[1] = [
          createBaseVNode("p", null, "暂无归档文章", -1)
        ])])) : (openBlock(), createElementBlock("div", _hoisted_6$5, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(archives.value, (list, year) => {
            return openBlock(), createElementBlock("div", {
              key: year,
              class: "year-block"
            }, [
              createBaseVNode("div", _hoisted_7$5, [
                createBaseVNode("span", _hoisted_8$5, toDisplayString(year), 1),
                createBaseVNode("span", _hoisted_9$5, "共 " + toDisplayString(list.length) + " 篇", 1)
              ]),
              createBaseVNode("ul", _hoisted_10$5, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(list, (art) => {
                  return openBlock(), createElementBlock("li", {
                    key: art.id,
                    class: "timeline-item"
                  }, [
                    _cache[2] || (_cache[2] = createBaseVNode("span", { class: "timeline-dot" }, null, -1)),
                    createBaseVNode("span", _hoisted_11$4, toDisplayString(art.createdAt ? art.createdAt.substring(5, 10) : ""), 1),
                    createVNode(_component_router_link, {
                      to: `/articles/${art.id}`,
                      class: "timeline-title"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(art.title), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"]),
                    art.category ? (openBlock(), createElementBlock("span", _hoisted_12$4, "[" + toDisplayString(art.category) + "]", 1)) : createCommentVNode("", true)
                  ]);
                }), 128))
              ])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
};
const ArchiveView = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-0ecfca37"]]);
const _hoisted_1$4 = { class: "login-wrapper" };
const _hoisted_2$4 = { class: "login-card" };
const _hoisted_3$4 = {
  key: 0,
  class: "error-banner"
};
const _hoisted_4$4 = { class: "form-group" };
const _hoisted_5$4 = { class: "input-with-icon" };
const _hoisted_6$4 = { class: "form-group" };
const _hoisted_7$4 = { class: "input-with-icon" };
const _hoisted_8$4 = ["disabled"];
const _hoisted_9$4 = { key: 0 };
const _hoisted_10$4 = { key: 1 };
const _sfc_main$4 = {
  __name: "LoginView",
  setup(__props) {
    const router2 = useRouter();
    const username = /* @__PURE__ */ ref("");
    const password = /* @__PURE__ */ ref("");
    const loading = /* @__PURE__ */ ref(false);
    const errorMsg = /* @__PURE__ */ ref("");
    async function handleLogin() {
      if (!username.value || !password.value) {
        errorMsg.value = "请完整填写用户名与密码";
        return;
      }
      loading.value = true;
      errorMsg.value = "";
      try {
        await authApi.login(username.value, password.value);
        router2.push("/admin/articles");
      } catch (err) {
        errorMsg.value = err.message || "登录失败，请检查用户名或密码";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createBaseVNode("div", _hoisted_2$4, [
          _cache[7] || (_cache[7] = createBaseVNode("div", { class: "login-header" }, [
            createBaseVNode("div", { class: "logo-circle" }, [
              createBaseVNode("span", null, "🛡️")
            ]),
            createBaseVNode("h1", { class: "login-title" }, "站长控制台登录"),
            createBaseVNode("p", { class: "login-subtitle" }, "管理个人站博文创作、作品发布与系统数据运维")
          ], -1)),
          createBaseVNode("form", {
            class: "login-form",
            onSubmit: withModifiers(handleLogin, ["prevent"])
          }, [
            errorMsg.value ? (openBlock(), createElementBlock("div", _hoisted_3$4, " ⚠️ " + toDisplayString(errorMsg.value), 1)) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_4$4, [
              _cache[3] || (_cache[3] = createBaseVNode("label", { class: "form-label" }, "管理员账号", -1)),
              createBaseVNode("div", _hoisted_5$4, [
                _cache[2] || (_cache[2] = createBaseVNode("span", { class: "field-icon" }, "👤", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => username.value = $event),
                  type: "text",
                  placeholder: "请输入管理员账号",
                  class: "form-input",
                  required: ""
                }, null, 512), [
                  [vModelText, username.value]
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_6$4, [
              _cache[5] || (_cache[5] = createBaseVNode("label", { class: "form-label" }, "管理密码", -1)),
              createBaseVNode("div", _hoisted_7$4, [
                _cache[4] || (_cache[4] = createBaseVNode("span", { class: "field-icon" }, "🔑", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => password.value = $event),
                  type: "password",
                  placeholder: "请输入密码",
                  class: "form-input",
                  required: ""
                }, null, 512), [
                  [vModelText, password.value]
                ])
              ])
            ]),
            createBaseVNode("button", {
              type: "submit",
              class: "submit-btn",
              disabled: loading.value
            }, [
              loading.value ? (openBlock(), createElementBlock("span", _hoisted_9$4, "验证鉴权中…")) : (openBlock(), createElementBlock("span", _hoisted_10$4, "立即登录控制台 →"))
            ], 8, _hoisted_8$4),
            createVNode(_component_router_link, {
              to: "/",
              class: "back-home-link"
            }, {
              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                createTextVNode(" ← 返回博客前台首页 ", -1)
              ])]),
              _: 1
            })
          ], 32)
        ])
      ]);
    };
  }
};
const LoginView = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-e6e347d0"]]);
const _hoisted_1$3 = { class: "admin-console-page" };
const _hoisted_2$3 = { class: "console-topbar-card" };
const _hoisted_3$3 = { class: "console-nav-tabs" };
const _hoisted_4$3 = { class: "console-right-actions" };
const _hoisted_5$3 = { class: "admin-stats-grid" };
const _hoisted_6$3 = { class: "admin-stat-card stat-cyan" };
const _hoisted_7$3 = { class: "stat-number" };
const _hoisted_8$3 = { class: "admin-stat-card stat-emerald" };
const _hoisted_9$3 = { class: "stat-number" };
const _hoisted_10$3 = { class: "admin-stat-card stat-amber" };
const _hoisted_11$3 = { class: "stat-number" };
const _hoisted_12$3 = { class: "admin-stat-card stat-purple" };
const _hoisted_13$3 = { class: "stat-number" };
const _hoisted_14$3 = { class: "console-main-panel" };
const _hoisted_15$3 = { class: "panel-header-bar" };
const _hoisted_16$3 = { class: "filter-pills-wrap" };
const _hoisted_17$3 = { class: "search-and-new-wrap" };
const _hoisted_18$3 = { class: "search-input-box" };
const _hoisted_19$3 = { class: "table-container" };
const _hoisted_20$3 = { class: "modern-admin-table" };
const _hoisted_21$3 = { key: 0 };
const _hoisted_22$3 = { key: 1 };
const _hoisted_23$3 = { class: "title-column-wrap" };
const _hoisted_24$3 = { class: "table-tags-list" };
const _hoisted_25$3 = { class: "category-badge" };
const _hoisted_26$3 = { class: "views-count" };
const _hoisted_27$3 = { class: "date-text" };
const _hoisted_28$3 = { class: "text-right" };
const _hoisted_29$3 = { class: "table-actions-group" };
const _hoisted_30$3 = ["title", "onClick"];
const _hoisted_31$3 = ["onClick"];
const _sfc_main$3 = {
  __name: "ArticleManageView",
  setup(__props) {
    const router2 = useRouter();
    const articles = /* @__PURE__ */ ref([]);
    const total = /* @__PURE__ */ ref(0);
    const page = /* @__PURE__ */ ref(1);
    const size = /* @__PURE__ */ ref(8);
    const totalPages = /* @__PURE__ */ ref(1);
    const loading = /* @__PURE__ */ ref(false);
    const keyword = /* @__PURE__ */ ref("");
    const statusFilter = /* @__PURE__ */ ref("");
    const stats = /* @__PURE__ */ ref({
      totalArticles: 0,
      publishedCount: 0,
      draftCount: 0,
      totalViews: 0
    });
    async function fetchStats() {
      try {
        const data = await articleApi.getArticleStats();
        if (data) {
          stats.value = data;
        }
      } catch (e) {
        console.error("获取文章统计异常", e);
      }
    }
    async function loadArticles() {
      loading.value = true;
      try {
        const res = await articleApi.getAdminArticles({
          page: page.value,
          size: size.value,
          keyword: keyword.value,
          status: statusFilter.value === "" ? void 0 : Number(statusFilter.value)
        });
        articles.value = res.list || [];
        total.value = res.total || 0;
        totalPages.value = res.totalPages || 1;
      } catch (e) {
        console.error("获取管理端文章列表异常", e);
      } finally {
        loading.value = false;
      }
    }
    function handleSearch() {
      page.value = 1;
      loadArticles();
    }
    function handleStatusFilter(val) {
      statusFilter.value = val;
      page.value = 1;
      loadArticles();
    }
    function handlePageChange(p2) {
      page.value = p2;
      loadArticles();
    }
    async function toggleStatus(art) {
      const newStatus = art.status === 1 ? 0 : 1;
      const actionText = newStatus === 1 ? "发布上线" : "转为草稿";
      if (!confirm(`确定要将《${art.title}》${actionText}吗？`)) return;
      try {
        await articleApi.patchArticleStatus(art.id, newStatus);
        art.status = newStatus;
        fetchStats();
      } catch (e) {
        alert(`${actionText}失败: ` + e.message);
      }
    }
    async function handleDelete(art) {
      if (!confirm(`【高危操作警告】确定要永久删除博文《${art.title}》吗？此操作不可恢复！`)) {
        return;
      }
      try {
        await articleApi.deleteArticle(art.id);
        alert("博文已成功删除");
        fetchStats();
        loadArticles();
      } catch (e) {
        alert("删除失败: " + e.message);
      }
    }
    function handleLogout() {
      if (confirm("确定要退出管理员登录吗？")) {
        authApi.logout();
        router2.push("/");
      }
    }
    onMounted(() => {
      fetchStats();
      loadArticles();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("header", _hoisted_2$3, [
          _cache[11] || (_cache[11] = createStaticVNode('<div class="console-brand" data-v-f34bf58a><div class="console-shield-badge" data-v-f34bf58a>⚙️</div><div class="console-brand-text" data-v-f34bf58a><span class="console-title" data-v-f34bf58a>博客后台管理</span><span class="console-runtime-badge" data-v-f34bf58a>文章与内容维护</span></div></div>', 1)),
          createBaseVNode("nav", _hoisted_3$3, [
            createVNode(_component_router_link, {
              to: "/admin/models",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[5] || (_cache[5] = [
                createTextVNode(" 🤖 模型监控审核 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles",
              class: "console-tab-item active"
            }, {
              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                createTextVNode(" 📝 博文管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/works",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                createTextVNode(" 🛠️ 作品管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles/new",
              class: "console-tab-item create-tab"
            }, {
              default: withCtx(() => [..._cache[8] || (_cache[8] = [
                createTextVNode(" ✍️ 撰写新博文 ", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_4$3, [
            _cache[10] || (_cache[10] = createBaseVNode("span", { class: "admin-user-pill" }, "👤 admin", -1)),
            createVNode(_component_router_link, {
              to: "/",
              target: "_blank",
              class: "preview-front-btn",
              title: "在新标签页预览前台"
            }, {
              default: withCtx(() => [..._cache[9] || (_cache[9] = [
                createTextVNode(" ↗ 前台博客 ", -1)
              ])]),
              _: 1
            }),
            createBaseVNode("button", {
              class: "console-logout-btn",
              title: "安全退出登录",
              onClick: handleLogout
            }, " 登出 ")
          ])
        ]),
        createBaseVNode("section", _hoisted_5$3, [
          createBaseVNode("div", _hoisted_6$3, [
            _cache[12] || (_cache[12] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "📚"),
              createBaseVNode("span", { class: "stat-tag" }, "ALL POSTS")
            ], -1)),
            createBaseVNode("div", _hoisted_7$3, toDisplayString(stats.value.totalArticles), 1),
            _cache[13] || (_cache[13] = createBaseVNode("div", { class: "stat-label" }, "总博文数", -1))
          ]),
          createBaseVNode("div", _hoisted_8$3, [
            _cache[14] || (_cache[14] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "🌐"),
              createBaseVNode("span", { class: "stat-tag" }, "ONLINE")
            ], -1)),
            createBaseVNode("div", _hoisted_9$3, toDisplayString(stats.value.publishedCount), 1),
            _cache[15] || (_cache[15] = createBaseVNode("div", { class: "stat-label" }, "已公开发布", -1))
          ]),
          createBaseVNode("div", _hoisted_10$3, [
            _cache[16] || (_cache[16] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "📝"),
              createBaseVNode("span", { class: "stat-tag" }, "DRAFT")
            ], -1)),
            createBaseVNode("div", _hoisted_11$3, toDisplayString(stats.value.draftCount), 1),
            _cache[17] || (_cache[17] = createBaseVNode("div", { class: "stat-label" }, "草稿箱存储", -1))
          ]),
          createBaseVNode("div", _hoisted_12$3, [
            _cache[18] || (_cache[18] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "👁️"),
              createBaseVNode("span", { class: "stat-tag" }, "VIEWS")
            ], -1)),
            createBaseVNode("div", _hoisted_13$3, toDisplayString(stats.value.totalViews), 1),
            _cache[19] || (_cache[19] = createBaseVNode("div", { class: "stat-label" }, "全站总阅读人次", -1))
          ])
        ]),
        createBaseVNode("main", _hoisted_14$3, [
          createBaseVNode("div", _hoisted_15$3, [
            createBaseVNode("div", _hoisted_16$3, [
              createBaseVNode("button", {
                class: normalizeClass(["filter-btn-pill", { active: statusFilter.value === "" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => handleStatusFilter(""))
              }, " 全部 (" + toDisplayString(total.value) + ") ", 3),
              createBaseVNode("button", {
                class: normalizeClass(["filter-btn-pill", { active: statusFilter.value === "1" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => handleStatusFilter("1"))
              }, " 🟢 已发布 ", 2),
              createBaseVNode("button", {
                class: normalizeClass(["filter-btn-pill", { active: statusFilter.value === "0" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => handleStatusFilter("0"))
              }, " 🟡 草稿 ", 2)
            ]),
            createBaseVNode("div", _hoisted_17$3, [
              createBaseVNode("div", _hoisted_18$3, [
                _cache[20] || (_cache[20] = createBaseVNode("span", { class: "search-ico" }, "🔍", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => keyword.value = $event),
                  type: "text",
                  placeholder: "搜索标题或摘要关键词...",
                  class: "search-input-field",
                  onKeyup: withKeys(handleSearch, ["enter"])
                }, null, 544), [
                  [vModelText, keyword.value]
                ]),
                keyword.value ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  class: "clear-search-btn",
                  onClick: _cache[4] || (_cache[4] = ($event) => {
                    keyword.value = "";
                    handleSearch();
                  })
                }, "✕")) : createCommentVNode("", true)
              ]),
              createBaseVNode("button", {
                class: "search-trigger-btn",
                onClick: handleSearch
              }, "搜索"),
              createVNode(_component_router_link, {
                to: "/admin/articles/new",
                class: "create-article-cta"
              }, {
                default: withCtx(() => [..._cache[21] || (_cache[21] = [
                  createTextVNode(" ✍️ 撰写新文章 ", -1)
                ])]),
                _: 1
              })
            ])
          ]),
          createBaseVNode("div", _hoisted_19$3, [
            createBaseVNode("table", _hoisted_20$3, [
              _cache[26] || (_cache[26] = createBaseVNode("thead", null, [
                createBaseVNode("tr", null, [
                  createBaseVNode("th", { width: "38%" }, "文章标题与标签"),
                  createBaseVNode("th", { width: "14%" }, "分类领域"),
                  createBaseVNode("th", { width: "12%" }, "发布状态"),
                  createBaseVNode("th", { width: "10%" }, "累计阅读"),
                  createBaseVNode("th", { width: "12%" }, "创建时间"),
                  createBaseVNode("th", {
                    width: "14%",
                    class: "text-right"
                  }, "管理操作")
                ])
              ], -1)),
              createBaseVNode("tbody", null, [
                loading.value ? (openBlock(), createElementBlock("tr", _hoisted_21$3, [..._cache[22] || (_cache[22] = [
                  createBaseVNode("td", {
                    colspan: "6",
                    class: "empty-cell"
                  }, [
                    createBaseVNode("span", { class: "loading-spinner" }, "⌛ 正在同步系统数据…")
                  ], -1)
                ])])) : articles.value.length === 0 ? (openBlock(), createElementBlock("tr", _hoisted_22$3, [..._cache[23] || (_cache[23] = [
                  createBaseVNode("td", {
                    colspan: "6",
                    class: "empty-cell"
                  }, " 📭 暂无符合条件的文章数据 ", -1)
                ])])) : createCommentVNode("", true),
                (openBlock(true), createElementBlock(Fragment, null, renderList(articles.value, (art) => {
                  return openBlock(), createElementBlock("tr", {
                    key: art.id,
                    class: "table-data-row"
                  }, [
                    createBaseVNode("td", null, [
                      createBaseVNode("div", _hoisted_23$3, [
                        createVNode(_component_router_link, {
                          to: `/articles/${art.id}`,
                          target: "_blank",
                          class: "table-art-link"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(art.title), 1)
                          ]),
                          _: 2
                        }, 1032, ["to"]),
                        createBaseVNode("div", _hoisted_24$3, [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(art.tags, (t) => {
                            return openBlock(), createElementBlock("span", {
                              key: t,
                              class: "mini-tag-pill"
                            }, "#" + toDisplayString(t), 1);
                          }), 128))
                        ])
                      ])
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("span", _hoisted_25$3, toDisplayString(art.category || "随笔"), 1)
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("span", {
                        class: normalizeClass(["status-glow-pill", art.status === 1 ? "is-published" : "is-draft"])
                      }, [
                        _cache[24] || (_cache[24] = createBaseVNode("span", { class: "glow-dot" }, null, -1)),
                        createTextVNode(" " + toDisplayString(art.status === 1 ? "已公开" : "草稿箱"), 1)
                      ], 2)
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("span", _hoisted_26$3, "👁️ " + toDisplayString(art.views || 0), 1)
                    ]),
                    createBaseVNode("td", _hoisted_27$3, toDisplayString(art.createdAt), 1),
                    createBaseVNode("td", _hoisted_28$3, [
                      createBaseVNode("div", _hoisted_29$3, [
                        createBaseVNode("button", {
                          class: normalizeClass(["action-mini-pill", art.status === 1 ? "btn-offline" : "btn-publish"]),
                          title: art.status === 1 ? "转为草稿下线" : "立即公开发布",
                          onClick: ($event) => toggleStatus(art)
                        }, toDisplayString(art.status === 1 ? "下线" : "发布"), 11, _hoisted_30$3),
                        createVNode(_component_router_link, {
                          to: `/admin/articles/edit/${art.id}`,
                          class: "action-mini-pill btn-edit"
                        }, {
                          default: withCtx(() => [..._cache[25] || (_cache[25] = [
                            createTextVNode(" 编辑 ", -1)
                          ])]),
                          _: 1
                        }, 8, ["to"]),
                        createBaseVNode("button", {
                          class: "action-mini-pill btn-delete",
                          onClick: ($event) => handleDelete(art)
                        }, " 删除 ", 8, _hoisted_31$3)
                      ])
                    ])
                  ]);
                }), 128))
              ])
            ])
          ]),
          createVNode(Pagination, {
            "current-page": page.value,
            "total-pages": totalPages.value,
            onChange: handlePageChange
          }, null, 8, ["current-page", "total-pages"])
        ])
      ]);
    };
  }
};
const ArticleManageView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-f34bf58a"]]);
const _hoisted_1$2 = { class: "edit-page" };
const _hoisted_2$2 = { class: "admin-topbar" };
const _hoisted_3$2 = { class: "topbar-left" };
const _hoisted_4$2 = { class: "title-with-nav" };
const _hoisted_5$2 = { class: "page-title" };
const _hoisted_6$2 = { class: "topbar-right" };
const _hoisted_7$2 = ["disabled"];
const _hoisted_8$2 = ["disabled"];
const _hoisted_9$2 = { class: "meta-bar-left" };
const _hoisted_10$2 = {
  key: 0,
  class: "meta-hint"
};
const _hoisted_11$2 = {
  type: "button",
  class: "drawer-toggle-btn"
};
const _hoisted_12$2 = { class: "meta-body" };
const _hoisted_13$2 = { class: "meta-row" };
const _hoisted_14$2 = { class: "meta-col col-grow" };
const _hoisted_15$2 = { class: "meta-col col-fixed" };
const _hoisted_16$2 = { class: "category-chips" };
const _hoisted_17$2 = ["onClick"];
const _hoisted_18$2 = { class: "meta-row" };
const _hoisted_19$2 = { class: "meta-col col-grow" };
const _hoisted_20$2 = { class: "meta-col col-fixed" };
const _hoisted_21$2 = {
  key: 0,
  class: "cover-preview-wrapper"
};
const _hoisted_22$2 = ["src"];
const _hoisted_23$2 = { class: "meta-row" };
const _hoisted_24$2 = { class: "meta-col full-width" };
const _hoisted_25$2 = { class: "label-with-tags" };
const _hoisted_26$2 = {
  key: 0,
  class: "tag-badges-preview"
};
const _hoisted_27$2 = { class: "preset-tags-bar" };
const _hoisted_28$2 = ["onClick"];
const _hoisted_29$2 = { class: "pane editor-pane" };
const _hoisted_30$2 = { class: "pane-header" };
const _hoisted_31$2 = { class: "tool-group" };
const _hoisted_32$2 = { class: "format-buttons" };
const _hoisted_33$2 = { class: "view-mode-selector" };
const _hoisted_34$2 = { class: "textarea-container" };
const _hoisted_35$2 = { class: "pane-footer" };
const _hoisted_36$2 = { class: "footer-stats" };
const _hoisted_37$2 = { class: "stat-pill" };
const _hoisted_38$2 = { class: "stat-pill" };
const _hoisted_39$2 = { class: "stat-pill" };
const _hoisted_40$2 = { class: "stat-pill highlight" };
const _hoisted_41$2 = { class: "pane preview-pane" };
const _hoisted_42$2 = { class: "pane-header preview-header" };
const _hoisted_43$1 = { class: "reading-indicator" };
const _hoisted_44$1 = { class: "preview-scroll-container" };
const _hoisted_45$1 = { class: "rendered-article-preview" };
const _hoisted_46$1 = {
  key: 0,
  class: "preview-article-header"
};
const _hoisted_47$1 = { class: "preview-cat-badge" };
const _hoisted_48$1 = { class: "preview-article-title" };
const _hoisted_49$1 = { class: "preview-article-meta" };
const _hoisted_50$1 = {
  key: 0,
  class: "preview-article-summary"
};
const _hoisted_51$1 = ["innerHTML"];
const _hoisted_52$1 = {
  key: 2,
  class: "preview-empty-state"
};
const _sfc_main$2 = {
  __name: "ArticleEditView",
  setup(__props) {
    const route = useRoute();
    const router2 = useRouter();
    const articleId = computed(() => route.params.id);
    const isEditMode = computed(() => Boolean(articleId.value));
    const form = /* @__PURE__ */ ref({
      title: "",
      summary: "",
      contentMd: "",
      coverUrl: "",
      category: "技术探讨",
      tagsString: "",
      status: 1
      // 0 草稿, 1 已发布
    });
    const submitting = /* @__PURE__ */ ref(false);
    const showMetaDrawer = /* @__PURE__ */ ref(true);
    const viewMode = /* @__PURE__ */ ref("split");
    const cursorInfo = /* @__PURE__ */ ref({ line: 1, col: 1 });
    const presetCategories = ["技术探讨", "架构设计", "后端开发", "前端工程", "性能调优", "DevOps", "阅读思考"];
    const presetTags = ["Java 21", "Spring Boot 3", "Vue 3", "MySQL", "Redis", "Docker", "架构设计", "高并发", "微服务"];
    const previewHtml = computed(() => renderMarkdown(form.value.contentMd));
    const stats = computed(() => {
      const base = calculateReadingStats(form.value.contentMd);
      const lineCount = form.value.contentMd ? form.value.contentMd.split("\n").length : 0;
      const charCount = form.value.contentMd ? form.value.contentMd.length : 0;
      return {
        ...base,
        lines: lineCount,
        chars: charCount
      };
    });
    const tagList = computed(() => {
      if (!form.value.tagsString) return [];
      return form.value.tagsString.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    });
    async function loadArticle() {
      if (!isEditMode.value) return;
      try {
        const data = await articleApi.getAdminArticleDetail(articleId.value);
        if (data) {
          form.value = {
            title: data.title || "",
            summary: data.summary || "",
            contentMd: data.contentMd || "",
            coverUrl: data.coverUrl || "",
            category: data.category || "技术探讨",
            tagsString: (data.tags || []).join(", "),
            status: data.status !== void 0 ? data.status : 1
          };
        }
      } catch (e) {
        alert("加载文章失败: " + e.message);
        router2.push("/admin/articles");
      }
    }
    function handleSelectCategory(cat) {
      form.value.category = cat;
    }
    function handleAddPresetTag(tag) {
      const currentTags = tagList.value;
      if (!currentTags.includes(tag)) {
        form.value.tagsString = currentTags.length > 0 ? `${form.value.tagsString}, ${tag}` : tag;
      }
    }
    function insertTemplate() {
      form.value.title = "Spring Boot 3.3 与虚拟线程高并发调优实战";
      form.value.summary = "详细梳理在生产级高吞吐系统中采用 Java 21 虚拟线程替代传统平台线程池的选型依据、踩坑点与实战评测。";
      form.value.category = "架构设计";
      form.value.tagsString = "Spring Boot, Java 21, 虚拟线程, 高并发, 性能调优";
      form.value.coverUrl = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
      form.value.contentMd = `# Spring Boot 3.3 与虚拟线程高并发调优实战

在传统的基于操作系统内核线程的 Servlet 容器中，每个 HTTP 请求绑定一个系统线程。当遇到大量数据库等待或下游 RPC 调用时，线程处于阻塞状态，造成极高的内存与上下文切换开销。

## 一、 核心架构配置

在 \`application.properties\` 中无缝启用虚拟线程支持：

\`\`\`properties
# 启用虚拟线程执行器
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200
\`\`\`

## 二、 关键性能基准对比

基于 wrk 压测 50,000 并发连接下的实测数据物证：

| 测试维度 | 传统平台线程池 (200 线程) | Java 21 虚拟线程 (按需动态创建) | 性能收益提升 |
|---|---|---|---|
| 最大并发连接 | ~1,600 req/s | > 52,000 req/s | **+3200%** |
| 内存开销 (RSS) | ~380 MB | ~48 MB | **-87.3%** |
| P99 响应延迟 | 145 ms | 19 ms | **-86.8%** |

## 三、 避坑避雷与生产纪律

> 💡 **架构黄金准则**：
> 1. **严禁将虚拟线程投入固定容量的线程池**！虚拟线程应当随任务诞生、瞬时销毁；
> 2. **警惕 \`synchronized\` 引起的载体线程锁死 (Thread Pinning)**，应全面升级为 \`ReentrantLock\`。

\`\`\`java
// 推荐的高并发锁写法
private final ReentrantLock lock = new ReentrantLock();

public void processTask() {
    lock.lock();
    try {
        // 执行安全业务逻辑
    } finally {
        lock.unlock();
    }
}
\`\`\`
`;
    }
    function insertMarkdownSnippet(prefix, suffix = "", defaultText = "文本") {
      const textarea = document.getElementById("md-editor-textarea");
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = form.value.contentMd.substring(start, end);
      const insertContent = selected || defaultText;
      const replacement = prefix + insertContent + suffix;
      form.value.contentMd = form.value.contentMd.substring(0, start) + replacement + form.value.contentMd.substring(end);
      setTimeout(() => {
        textarea.focus();
        const newCursor = start + prefix.length + insertContent.length;
        textarea.setSelectionRange(newCursor, newCursor);
        updateCursorInfo();
      }, 0);
    }
    function handleKeydown(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        insertMarkdownSnippet("  ", "", "");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(0);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave(1);
        return;
      }
    }
    function updateCursorInfo() {
      const textarea = document.getElementById("md-editor-textarea");
      if (!textarea) return;
      const pos = textarea.selectionStart;
      const textBefore = form.value.contentMd.substring(0, pos);
      const lines = textBefore.split("\n");
      cursorInfo.value = {
        line: lines.length,
        col: lines[lines.length - 1].length + 1
      };
    }
    async function handleSave(statusToSet) {
      if (!form.value.title.trim()) {
        alert("请填写文章标题");
        return;
      }
      if (!form.value.contentMd.trim()) {
        alert("请撰写文章 Markdown 正文");
        return;
      }
      const tags = tagList.value;
      const payload = {
        title: form.value.title,
        summary: form.value.summary,
        contentMd: form.value.contentMd,
        coverUrl: form.value.coverUrl,
        category: form.value.category,
        tags,
        status: statusToSet !== void 0 ? statusToSet : form.value.status
      };
      submitting.value = true;
      try {
        if (isEditMode.value) {
          await articleApi.updateArticle(articleId.value, payload);
          alert("博文已成功更新！");
        } else {
          await articleApi.createArticle(payload);
          alert("博文已成功发布上线！");
        }
        router2.push("/admin/articles");
      } catch (e) {
        alert("保存失败: " + e.message);
      } finally {
        submitting.value = false;
      }
    }
    function handleLogout() {
      if (confirm("确定要退出管理员登录吗？")) {
        authApi.logout();
        router2.push("/admin/login");
      }
    }
    onMounted(() => {
      loadArticle();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("header", _hoisted_2$2, [
          createBaseVNode("div", _hoisted_3$2, [
            _cache[25] || (_cache[25] = createBaseVNode("div", { class: "console-badge" }, [
              createBaseVNode("span", null, "内容编辑")
            ], -1)),
            createBaseVNode("div", _hoisted_4$2, [
              createVNode(_component_router_link, {
                to: "/admin/articles",
                class: "back-link"
              }, {
                default: withCtx(() => [..._cache[24] || (_cache[24] = [
                  createBaseVNode("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2.5"
                  }, [
                    createBaseVNode("path", { d: "M19 12H5M12 19l-7-7 7-7" })
                  ], -1),
                  createTextVNode(" 返回管理 ", -1)
                ])]),
                _: 1
              }),
              createBaseVNode("h1", _hoisted_5$2, toDisplayString(isEditMode.value ? "编辑博文" : "撰写新博文"), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_6$2, [
            createBaseVNode("button", {
              type: "button",
              class: "action-btn outline-btn",
              onClick: insertTemplate,
              title: "填入预置高并发工程实战范文"
            }, [..._cache[26] || (_cache[26] = [
              createBaseVNode("span", { class: "btn-icon" }, "⚡", -1),
              createBaseVNode("span", null, "技术样例范文", -1)
            ])]),
            createBaseVNode("button", {
              type: "button",
              class: "action-btn draft-btn",
              disabled: submitting.value,
              onClick: _cache[0] || (_cache[0] = ($event) => handleSave(0)),
              title: "快捷键: Ctrl + S"
            }, [..._cache[27] || (_cache[27] = [
              createBaseVNode("span", { class: "btn-icon" }, "💾", -1),
              createBaseVNode("span", null, "暂存草稿", -1)
            ])], 8, _hoisted_7$2),
            createBaseVNode("button", {
              type: "button",
              class: "action-btn publish-btn",
              disabled: submitting.value,
              onClick: _cache[1] || (_cache[1] = ($event) => handleSave(1)),
              title: "快捷键: Ctrl + Enter"
            }, [
              _cache[28] || (_cache[28] = createBaseVNode("span", { class: "btn-icon" }, "🚀", -1)),
              createBaseVNode("span", null, toDisplayString(submitting.value ? "保存中…" : isEditMode.value ? "更新发布" : "立即发布"), 1)
            ], 8, _hoisted_8$2),
            _cache[32] || (_cache[32] = createBaseVNode("div", { class: "nav-divider" }, null, -1)),
            createVNode(_component_router_link, {
              to: "/admin/articles",
              class: "nav-tab active"
            }, {
              default: withCtx(() => [..._cache[29] || (_cache[29] = [
                createTextVNode("文章", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/works",
              class: "nav-tab"
            }, {
              default: withCtx(() => [..._cache[30] || (_cache[30] = [
                createTextVNode("作品", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/",
              class: "view-site-btn",
              target: "_blank"
            }, {
              default: withCtx(() => [..._cache[31] || (_cache[31] = [
                createTextVNode("↗ 前台", -1)
              ])]),
              _: 1
            }),
            createBaseVNode("button", {
              class: "logout-btn",
              onClick: handleLogout,
              title: "退出后台"
            }, "登出")
          ])
        ]),
        createBaseVNode("section", {
          class: normalizeClass(["meta-section", { "collapsed": !showMetaDrawer.value }])
        }, [
          createBaseVNode("div", {
            class: "meta-header-bar",
            onClick: _cache[2] || (_cache[2] = ($event) => showMetaDrawer.value = !showMetaDrawer.value)
          }, [
            createBaseVNode("div", _hoisted_9$2, [
              _cache[33] || (_cache[33] = createBaseVNode("span", { class: "meta-icon" }, "⚙️", -1)),
              _cache[34] || (_cache[34] = createBaseVNode("span", { class: "meta-heading" }, "文章属性与元数据配置", -1)),
              !showMetaDrawer.value ? (openBlock(), createElementBlock("span", _hoisted_10$2, " [" + toDisplayString(form.value.category || "未分类") + "] " + toDisplayString(form.value.title || "（未输入标题）"), 1)) : createCommentVNode("", true)
            ]),
            createBaseVNode("button", _hoisted_11$2, toDisplayString(showMetaDrawer.value ? "收起配置 ▲" : "展开配置 ▼"), 1)
          ]),
          withDirectives(createBaseVNode("div", _hoisted_12$2, [
            createBaseVNode("div", _hoisted_13$2, [
              createBaseVNode("div", _hoisted_14$2, [
                _cache[35] || (_cache[35] = createBaseVNode("label", { class: "meta-label" }, [
                  createBaseVNode("span", null, "文章主标题"),
                  createBaseVNode("span", { class: "required-star" }, "*")
                ], -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.value.title = $event),
                  type: "text",
                  placeholder: "例如：Spring Boot 3 与虚拟线程生产环境落地全纪实...",
                  class: "meta-input title-input",
                  required: ""
                }, null, 512), [
                  [vModelText, form.value.title]
                ])
              ]),
              createBaseVNode("div", _hoisted_15$2, [
                _cache[36] || (_cache[36] = createBaseVNode("label", { class: "meta-label" }, "所属分类", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.category = $event),
                  type: "text",
                  placeholder: "自定义或选择...",
                  class: "meta-input"
                }, null, 512), [
                  [vModelText, form.value.category]
                ]),
                createBaseVNode("div", _hoisted_16$2, [
                  (openBlock(), createElementBlock(Fragment, null, renderList(presetCategories, (cat) => {
                    return createBaseVNode("span", {
                      key: cat,
                      class: normalizeClass(["cat-chip", { active: form.value.category === cat }]),
                      onClick: ($event) => handleSelectCategory(cat)
                    }, toDisplayString(cat), 11, _hoisted_17$2);
                  }), 64))
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_18$2, [
              createBaseVNode("div", _hoisted_19$2, [
                _cache[37] || (_cache[37] = createBaseVNode("label", { class: "meta-label" }, "文章摘要 (Summary)", -1)),
                withDirectives(createBaseVNode("textarea", {
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.summary = $event),
                  rows: "2",
                  placeholder: "概括文章核心技术价值，将在首页和列表页流式呈现...",
                  class: "meta-input meta-textarea"
                }, null, 512), [
                  [vModelText, form.value.summary]
                ])
              ]),
              createBaseVNode("div", _hoisted_20$2, [
                _cache[39] || (_cache[39] = createBaseVNode("label", { class: "meta-label" }, "封面图片 URL (选填)", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.coverUrl = $event),
                  type: "url",
                  placeholder: "https://images.unsplash.com/...",
                  class: "meta-input"
                }, null, 512), [
                  [vModelText, form.value.coverUrl]
                ]),
                form.value.coverUrl ? (openBlock(), createElementBlock("div", _hoisted_21$2, [
                  createBaseVNode("img", {
                    src: form.value.coverUrl,
                    alt: "Cover Preview",
                    class: "cover-thumb",
                    onError: _cache[7] || (_cache[7] = ($event) => $event.target.style.display = "none")
                  }, null, 40, _hoisted_22$2),
                  _cache[38] || (_cache[38] = createBaseVNode("span", { class: "cover-status" }, "封面预览成功", -1))
                ])) : createCommentVNode("", true)
              ])
            ]),
            createBaseVNode("div", _hoisted_23$2, [
              createBaseVNode("div", _hoisted_24$2, [
                createBaseVNode("div", _hoisted_25$2, [
                  _cache[40] || (_cache[40] = createBaseVNode("label", { class: "meta-label" }, "技术标签 (逗号分隔)", -1)),
                  tagList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_26$2, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(tagList.value, (tag) => {
                      return openBlock(), createElementBlock("span", {
                        key: tag,
                        class: "tag-badge"
                      }, " # " + toDisplayString(tag), 1);
                    }), 128))
                  ])) : createCommentVNode("", true)
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.tagsString = $event),
                  type: "text",
                  placeholder: "输入标签，以逗号分隔，如：Java 21, Spring Boot, 虚拟线程",
                  class: "meta-input"
                }, null, 512), [
                  [vModelText, form.value.tagsString]
                ]),
                createBaseVNode("div", _hoisted_27$2, [
                  _cache[41] || (_cache[41] = createBaseVNode("span", { class: "preset-title" }, "推荐标签：", -1)),
                  (openBlock(), createElementBlock(Fragment, null, renderList(presetTags, (ptag) => {
                    return createBaseVNode("button", {
                      key: ptag,
                      type: "button",
                      class: "preset-tag-btn",
                      onClick: ($event) => handleAddPresetTag(ptag)
                    }, " + " + toDisplayString(ptag), 9, _hoisted_28$2);
                  }), 64))
                ])
              ])
            ])
          ], 512), [
            [vShow, showMetaDrawer.value]
          ])
        ], 2),
        createBaseVNode("main", {
          class: normalizeClass(["editor-workspace", `view-${viewMode.value}`])
        }, [
          withDirectives(createBaseVNode("section", _hoisted_29$2, [
            createBaseVNode("div", _hoisted_30$2, [
              createBaseVNode("div", _hoisted_31$2, [
                _cache[47] || (_cache[47] = createBaseVNode("span", { class: "pane-tag" }, "SOURCE MD", -1)),
                createBaseVNode("div", _hoisted_32$2, [
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[9] || (_cache[9] = ($event) => insertMarkdownSnippet("**", "**", "粗体文字")),
                    title: "粗体 (Ctrl+B)"
                  }, [..._cache[42] || (_cache[42] = [
                    createBaseVNode("b", null, "B", -1)
                  ])]),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[10] || (_cache[10] = ($event) => insertMarkdownSnippet("*", "*", "斜体文字")),
                    title: "斜体"
                  }, [..._cache[43] || (_cache[43] = [
                    createBaseVNode("i", null, "I", -1)
                  ])]),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[11] || (_cache[11] = ($event) => insertMarkdownSnippet("~~", "~~", "删除线")),
                    title: "删除线"
                  }, [..._cache[44] || (_cache[44] = [
                    createBaseVNode("s", null, "S", -1)
                  ])]),
                  _cache[45] || (_cache[45] = createBaseVNode("span", { class: "fmt-divider" }, null, -1)),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[12] || (_cache[12] = ($event) => insertMarkdownSnippet("# ", "", "一级标题")),
                    title: "一级标题"
                  }, "H1"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[13] || (_cache[13] = ($event) => insertMarkdownSnippet("## ", "", "二级标题")),
                    title: "二级标题"
                  }, "H2"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[14] || (_cache[14] = ($event) => insertMarkdownSnippet("### ", "", "三级标题")),
                    title: "三级标题"
                  }, "H3"),
                  _cache[46] || (_cache[46] = createBaseVNode("span", { class: "fmt-divider" }, null, -1)),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[15] || (_cache[15] = ($event) => insertMarkdownSnippet("> ", "", "精选引用或核心观点")),
                    title: "引用块"
                  }, "”"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[16] || (_cache[16] = ($event) => insertMarkdownSnippet("`", "`", "code")),
                    title: "行内代码"
                  }, "</>"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[17] || (_cache[17] = ($event) => insertMarkdownSnippet("```java\n", "\n```", "// 业务核心逻辑\n")),
                    title: "代码块"
                  }, "BLOCK"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[18] || (_cache[18] = ($event) => insertMarkdownSnippet("| 表头 1 | 表头 2 |\n|---|---|\n| 数据项 | 数据项 |\n", "", "")),
                    title: "插入表格"
                  }, "TABLE"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "fmt-btn",
                    onClick: _cache[19] || (_cache[19] = ($event) => insertMarkdownSnippet("[", "](https://example.com)", "链接描述")),
                    title: "超链接"
                  }, "LINK")
                ])
              ]),
              createBaseVNode("div", _hoisted_33$2, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass(["mode-btn", { active: viewMode.value === "edit" }]),
                  onClick: _cache[20] || (_cache[20] = ($event) => viewMode.value = "edit"),
                  title: "仅展示编辑器"
                }, " 纯写 ", 2),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass(["mode-btn", { active: viewMode.value === "split" }]),
                  onClick: _cache[21] || (_cache[21] = ($event) => viewMode.value = "split"),
                  title: "左右分屏实时对比"
                }, " 双栏 ", 2),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass(["mode-btn", { active: viewMode.value === "preview" }]),
                  onClick: _cache[22] || (_cache[22] = ($event) => viewMode.value = "preview"),
                  title: "仅展示排版预览"
                }, " 预览 ", 2)
              ])
            ]),
            createBaseVNode("div", _hoisted_34$2, [
              withDirectives(createBaseVNode("textarea", {
                id: "md-editor-textarea",
                "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => form.value.contentMd = $event),
                class: "md-code-input",
                placeholder: "在此挥洒技术灵感... 支持完整 GFM Markdown 语法、表格与高亮代码块 (Tab 缩进 2 空格，Ctrl+S 保存草稿)",
                spellcheck: "false",
                onKeydown: handleKeydown,
                onClick: updateCursorInfo,
                onKeyup: updateCursorInfo
              }, null, 544), [
                [vModelText, form.value.contentMd]
              ])
            ]),
            createBaseVNode("div", _hoisted_35$2, [
              createBaseVNode("div", _hoisted_36$2, [
                createBaseVNode("span", _hoisted_37$2, "行 " + toDisplayString(cursorInfo.value.line) + " : 列 " + toDisplayString(cursorInfo.value.col), 1),
                createBaseVNode("span", _hoisted_38$2, toDisplayString(stats.value.lines) + " 行", 1),
                createBaseVNode("span", _hoisted_39$2, toDisplayString(stats.value.words) + " 词 / " + toDisplayString(stats.value.chars) + " 字符", 1),
                createBaseVNode("span", _hoisted_40$2, "预计阅读 " + toDisplayString(stats.value.readMinutes) + " 分钟", 1)
              ]),
              _cache[48] || (_cache[48] = createBaseVNode("div", { class: "footer-shortcuts" }, [
                createBaseVNode("span", null, "Tab 缩进"),
                createBaseVNode("span", null, "Ctrl+S 暂存"),
                createBaseVNode("span", null, "Ctrl+Enter 发布")
              ], -1))
            ])
          ], 512), [
            [vShow, viewMode.value !== "preview"]
          ]),
          withDirectives(createBaseVNode("section", _hoisted_41$2, [
            createBaseVNode("div", _hoisted_42$2, [
              _cache[49] || (_cache[49] = createBaseVNode("div", { class: "preview-title-wrap" }, [
                createBaseVNode("span", { class: "pulse-indicator" }),
                createBaseVNode("span", { class: "pane-tag" }, "LIVE PREVIEW"),
                createBaseVNode("span", { class: "preview-sync-note" }, "1:1 同步渲染")
              ], -1)),
              createBaseVNode("div", _hoisted_43$1, " 阅读时长：" + toDisplayString(stats.value.readMinutes) + " min · " + toDisplayString(stats.value.words) + " 词 ", 1)
            ]),
            createBaseVNode("div", _hoisted_44$1, [
              createBaseVNode("article", _hoisted_45$1, [
                form.value.title ? (openBlock(), createElementBlock("header", _hoisted_46$1, [
                  createBaseVNode("div", _hoisted_47$1, toDisplayString(form.value.category || "技术探讨"), 1),
                  createBaseVNode("h1", _hoisted_48$1, toDisplayString(form.value.title), 1),
                  createBaseVNode("div", _hoisted_49$1, [
                    _cache[50] || (_cache[50] = createBaseVNode("span", null, "作者：Simon", -1)),
                    _cache[51] || (_cache[51] = createBaseVNode("span", null, "•", -1)),
                    createBaseVNode("span", null, toDisplayString(stats.value.words) + " 字", 1),
                    _cache[52] || (_cache[52] = createBaseVNode("span", null, "•", -1)),
                    createBaseVNode("span", null, toDisplayString(stats.value.readMinutes) + " 分钟阅读", 1)
                  ]),
                  form.value.summary ? (openBlock(), createElementBlock("p", _hoisted_50$1, toDisplayString(form.value.summary), 1)) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                form.value.contentMd.trim() ? (openBlock(), createElementBlock("div", {
                  key: 1,
                  class: "markdown-body custom-markdown",
                  innerHTML: previewHtml.value
                }, null, 8, _hoisted_51$1)) : (openBlock(), createElementBlock("div", _hoisted_52$1, [
                  _cache[53] || (_cache[53] = createBaseVNode("div", { class: "empty-icon" }, "📝", -1)),
                  _cache[54] || (_cache[54] = createBaseVNode("h3", { class: "empty-title" }, "等待 Markdown 内容输入...", -1)),
                  _cache[55] || (_cache[55] = createBaseVNode("p", { class: "empty-desc" }, " 在左侧键入 Markdown 文本，右侧将以高精度格式、极客科技风标题线与代码高亮实时渲染。 ", -1)),
                  createBaseVNode("button", {
                    type: "button",
                    class: "insert-sample-btn",
                    onClick: insertTemplate
                  }, " ⚡ 载入范例文档体验 ")
                ]))
              ])
            ])
          ], 512), [
            [vShow, viewMode.value !== "edit"]
          ])
        ], 2)
      ]);
    };
  }
};
const ArticleEditView = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-33ce8147"]]);
const _hoisted_1$1 = { class: "admin-console-page" };
const _hoisted_2$1 = { class: "console-topbar-card" };
const _hoisted_3$1 = { class: "console-nav-tabs" };
const _hoisted_4$1 = { class: "console-right-actions" };
const _hoisted_5$1 = { class: "console-main-panel" };
const _hoisted_6$1 = { class: "panel-header-bar" };
const _hoisted_7$1 = { class: "title-with-count" };
const _hoisted_8$1 = { class: "section-title" };
const _hoisted_9$1 = { class: "table-container" };
const _hoisted_10$1 = { class: "modern-admin-table" };
const _hoisted_11$1 = { key: 0 };
const _hoisted_12$1 = { key: 1 };
const _hoisted_13$1 = { class: "work-identity-cell" };
const _hoisted_14$1 = ["src", "alt"];
const _hoisted_15$1 = { class: "work-title-wrap" };
const _hoisted_16$1 = { class: "work-name" };
const _hoisted_17$1 = { class: "work-links-row" };
const _hoisted_18$1 = ["href"];
const _hoisted_19$1 = ["href"];
const _hoisted_20$1 = { class: "work-desc-text" };
const _hoisted_21$1 = { class: "work-tech-pills" };
const _hoisted_22$1 = { class: "order-badge" };
const _hoisted_23$1 = { class: "text-right" };
const _hoisted_24$1 = { class: "table-actions-group" };
const _hoisted_25$1 = ["onClick"];
const _hoisted_26$1 = ["onClick"];
const _hoisted_27$1 = { class: "modal-card" };
const _hoisted_28$1 = { class: "modal-header" };
const _hoisted_29$1 = { class: "modal-heading" };
const _hoisted_30$1 = { class: "form-group" };
const _hoisted_31$1 = { class: "form-group" };
const _hoisted_32$1 = { class: "form-row-2" };
const _hoisted_33$1 = { class: "form-group" };
const _hoisted_34$1 = { class: "form-group" };
const _hoisted_35$1 = { class: "form-group" };
const _hoisted_36$1 = {
  key: 0,
  class: "img-preview-box"
};
const _hoisted_37$1 = ["src"];
const _hoisted_38$1 = { class: "form-row-2" };
const _hoisted_39$1 = { class: "form-group" };
const _hoisted_40$1 = { class: "form-group" };
const _hoisted_41$1 = { class: "modal-footer" };
const _hoisted_42$1 = ["disabled"];
const _sfc_main$1 = {
  __name: "WorkManageView",
  setup(__props) {
    const router2 = useRouter();
    const works = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    const isModalOpen = /* @__PURE__ */ ref(false);
    const modalTitle = /* @__PURE__ */ ref("新增作品");
    const editingId = /* @__PURE__ */ ref(null);
    const submitting = /* @__PURE__ */ ref(false);
    const form = /* @__PURE__ */ ref({
      title: "",
      description: "",
      coverUrl: "",
      demoUrl: "",
      githubUrl: "",
      techStackString: "",
      sortOrder: 0
    });
    function getTagColorClass(tag) {
      if (!tag) return "tag-cyan";
      const hash = tag.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const classes = ["tag-cyan", "tag-emerald", "tag-violet", "tag-amber", "tag-rose"];
      return classes[hash % classes.length];
    }
    async function loadWorks() {
      loading.value = true;
      try {
        const list = await workApi.getWorks();
        works.value = list || [];
      } catch (e) {
        console.error("加载作品异常", e);
      } finally {
        loading.value = false;
      }
    }
    function openCreateModal() {
      editingId.value = null;
      modalTitle.value = "新增作品";
      form.value = {
        title: "",
        description: "",
        coverUrl: "",
        demoUrl: "",
        githubUrl: "",
        techStackString: "",
        sortOrder: works.value.length + 1
      };
      isModalOpen.value = true;
    }
    function openEditModal(w) {
      editingId.value = w.id;
      modalTitle.value = "编辑作品";
      form.value = {
        title: w.title || "",
        description: w.description || "",
        coverUrl: w.coverUrl || "",
        demoUrl: w.demoUrl || "",
        githubUrl: w.githubUrl || "",
        techStackString: (w.techStack || []).join(", "),
        sortOrder: w.sortOrder !== void 0 ? w.sortOrder : 0
      };
      isModalOpen.value = true;
    }
    async function handleSave() {
      if (!form.value.title.trim()) {
        alert("请填写作品名称");
        return;
      }
      const techStack = form.value.techStackString.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      const payload = {
        title: form.value.title,
        description: form.value.description,
        coverUrl: form.value.coverUrl,
        demoUrl: form.value.demoUrl,
        githubUrl: form.value.githubUrl,
        techStack,
        sortOrder: Number(form.value.sortOrder) || 0
      };
      submitting.value = true;
      try {
        if (editingId.value) {
          await workApi.updateWork(editingId.value, payload);
          alert("作品更新成功！");
        } else {
          await workApi.createWork(payload);
          alert("作品新增成功！");
        }
        isModalOpen.value = false;
        loadWorks();
      } catch (e) {
        alert("保存失败: " + e.message);
      } finally {
        submitting.value = false;
      }
    }
    async function handleDelete(w) {
      if (!confirm(`【高危操作警告】确定要删除作品《${w.title}》吗？`)) {
        return;
      }
      try {
        await workApi.deleteWork(w.id);
        alert("作品已成功删除");
        loadWorks();
      } catch (e) {
        alert("删除失败: " + e.message);
      }
    }
    function handleLogout() {
      if (confirm("确定要退出管理员登录吗？")) {
        authApi.logout();
        router2.push("/");
      }
    }
    onMounted(() => {
      loadWorks();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("header", _hoisted_2$1, [
          _cache[16] || (_cache[16] = createStaticVNode('<div class="console-brand" data-v-a2ba8488><div class="console-shield-badge" data-v-a2ba8488>⚙️</div><div class="console-brand-text" data-v-a2ba8488><span class="console-title" data-v-a2ba8488>博客后台管理</span><span class="console-runtime-badge" data-v-a2ba8488>作品项目维护</span></div></div>', 1)),
          createBaseVNode("nav", _hoisted_3$1, [
            createVNode(_component_router_link, {
              to: "/admin/models",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[10] || (_cache[10] = [
                createTextVNode(" 🤖 模型监控审核 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode(" 📝 博文管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/works",
              class: "console-tab-item active"
            }, {
              default: withCtx(() => [..._cache[12] || (_cache[12] = [
                createTextVNode(" 🛠️ 作品管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles/new",
              class: "console-tab-item create-tab"
            }, {
              default: withCtx(() => [..._cache[13] || (_cache[13] = [
                createTextVNode(" ✍️ 撰写新博文 ", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_4$1, [
            _cache[15] || (_cache[15] = createBaseVNode("span", { class: "admin-user-pill" }, "👤 admin", -1)),
            createVNode(_component_router_link, {
              to: "/",
              target: "_blank",
              class: "preview-front-btn",
              title: "在新标签页预览前台"
            }, {
              default: withCtx(() => [..._cache[14] || (_cache[14] = [
                createTextVNode(" ↗ 前台博客 ", -1)
              ])]),
              _: 1
            }),
            createBaseVNode("button", {
              class: "console-logout-btn",
              title: "安全退出登录",
              onClick: handleLogout
            }, " 登出 ")
          ])
        ]),
        createBaseVNode("main", _hoisted_5$1, [
          createBaseVNode("div", _hoisted_6$1, [
            createBaseVNode("div", _hoisted_7$1, [
              createBaseVNode("h2", _hoisted_8$1, "作品仓库列表 (" + toDisplayString(works.value.length) + ")", 1),
              _cache[17] || (_cache[17] = createBaseVNode("span", { class: "section-desc" }, "维护个人代表性工程开源成果、演示体验地址与技术栈", -1))
            ]),
            createBaseVNode("button", {
              class: "create-work-cta",
              onClick: openCreateModal
            }, " ➕ 新增代表作品 ")
          ]),
          createBaseVNode("div", _hoisted_9$1, [
            createBaseVNode("table", _hoisted_10$1, [
              _cache[20] || (_cache[20] = createBaseVNode("thead", null, [
                createBaseVNode("tr", null, [
                  createBaseVNode("th", { width: "30%" }, "作品信息"),
                  createBaseVNode("th", { width: "32%" }, "详细描述"),
                  createBaseVNode("th", { width: "18%" }, "技术栈"),
                  createBaseVNode("th", { width: "8%" }, "权重"),
                  createBaseVNode("th", {
                    width: "12%",
                    class: "text-right"
                  }, "管理操作")
                ])
              ], -1)),
              createBaseVNode("tbody", null, [
                loading.value ? (openBlock(), createElementBlock("tr", _hoisted_11$1, [..._cache[18] || (_cache[18] = [
                  createBaseVNode("td", {
                    colspan: "5",
                    class: "empty-cell"
                  }, " ⌛ 正在读取作品数据… ", -1)
                ])])) : works.value.length === 0 ? (openBlock(), createElementBlock("tr", _hoisted_12$1, [..._cache[19] || (_cache[19] = [
                  createBaseVNode("td", {
                    colspan: "5",
                    class: "empty-cell"
                  }, " 📦 暂无作品数据，点击右上角“新增代表作品”添加 ", -1)
                ])])) : createCommentVNode("", true),
                (openBlock(true), createElementBlock(Fragment, null, renderList(works.value, (w) => {
                  return openBlock(), createElementBlock("tr", {
                    key: w.id,
                    class: "table-data-row"
                  }, [
                    createBaseVNode("td", null, [
                      createBaseVNode("div", _hoisted_13$1, [
                        w.coverUrl ? (openBlock(), createElementBlock("img", {
                          key: 0,
                          src: w.coverUrl,
                          alt: w.title,
                          class: "work-thumb-mini"
                        }, null, 8, _hoisted_14$1)) : createCommentVNode("", true),
                        createBaseVNode("div", _hoisted_15$1, [
                          createBaseVNode("span", _hoisted_16$1, toDisplayString(w.title), 1),
                          createBaseVNode("div", _hoisted_17$1, [
                            w.demoUrl ? (openBlock(), createElementBlock("a", {
                              key: 0,
                              href: w.demoUrl,
                              target: "_blank",
                              class: "mini-ext-link"
                            }, " 演示 ↗ ", 8, _hoisted_18$1)) : createCommentVNode("", true),
                            w.githubUrl ? (openBlock(), createElementBlock("a", {
                              key: 1,
                              href: w.githubUrl,
                              target: "_blank",
                              class: "mini-ext-link"
                            }, " 源码 ↗ ", 8, _hoisted_19$1)) : createCommentVNode("", true)
                          ])
                        ])
                      ])
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("p", _hoisted_20$1, toDisplayString(w.description), 1)
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("div", _hoisted_21$1, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(w.techStack, (t) => {
                          return openBlock(), createElementBlock("span", {
                            key: t,
                            class: normalizeClass(["tech-pill", getTagColorClass(t)])
                          }, toDisplayString(t), 3);
                        }), 128))
                      ])
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("span", _hoisted_22$1, toDisplayString(w.sortOrder || 0), 1)
                    ]),
                    createBaseVNode("td", _hoisted_23$1, [
                      createBaseVNode("div", _hoisted_24$1, [
                        createBaseVNode("button", {
                          class: "action-mini-pill btn-edit",
                          onClick: ($event) => openEditModal(w)
                        }, " 编辑 ", 8, _hoisted_25$1),
                        createBaseVNode("button", {
                          class: "action-mini-pill btn-delete",
                          onClick: ($event) => handleDelete(w)
                        }, " 删除 ", 8, _hoisted_26$1)
                      ])
                    ])
                  ]);
                }), 128))
              ])
            ])
          ])
        ]),
        isModalOpen.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "modal-backdrop",
          onClick: _cache[9] || (_cache[9] = withModifiers(($event) => isModalOpen.value = false, ["self"]))
        }, [
          createBaseVNode("div", _hoisted_27$1, [
            createBaseVNode("div", _hoisted_28$1, [
              createBaseVNode("h3", _hoisted_29$1, toDisplayString(modalTitle.value), 1),
              createBaseVNode("button", {
                class: "modal-close-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => isModalOpen.value = false)
              }, "✕")
            ]),
            createBaseVNode("form", {
              class: "modal-form",
              onSubmit: withModifiers(handleSave, ["prevent"])
            }, [
              createBaseVNode("div", _hoisted_30$1, [
                _cache[21] || (_cache[21] = createBaseVNode("label", { class: "form-label" }, "作品名称 *", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.value.title = $event),
                  type: "text",
                  placeholder: "例如：极简个人全栈博客系统",
                  class: "modal-input",
                  required: ""
                }, null, 512), [
                  [vModelText, form.value.title]
                ])
              ]),
              createBaseVNode("div", _hoisted_31$1, [
                _cache[22] || (_cache[22] = createBaseVNode("label", { class: "form-label" }, "简要描述", -1)),
                withDirectives(createBaseVNode("textarea", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.value.description = $event),
                  rows: "3",
                  placeholder: "一句话清晰说明该作品的架构特色或业务功能...",
                  class: "modal-textarea"
                }, null, 512), [
                  [vModelText, form.value.description]
                ])
              ]),
              createBaseVNode("div", _hoisted_32$1, [
                createBaseVNode("div", _hoisted_33$1, [
                  _cache[23] || (_cache[23] = createBaseVNode("label", { class: "form-label" }, "技术栈标签（逗号隔开）", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.value.techStackString = $event),
                    type: "text",
                    placeholder: "Spring Boot 4, Vue 3, Vite",
                    class: "modal-input"
                  }, null, 512), [
                    [vModelText, form.value.techStackString]
                  ])
                ]),
                createBaseVNode("div", _hoisted_34$1, [
                  _cache[24] || (_cache[24] = createBaseVNode("label", { class: "form-label" }, "排序权重（越大越靠前）", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.sortOrder = $event),
                    type: "number",
                    class: "modal-input"
                  }, null, 512), [
                    [
                      vModelText,
                      form.value.sortOrder,
                      void 0,
                      { number: true }
                    ]
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_35$1, [
                _cache[25] || (_cache[25] = createBaseVNode("label", { class: "form-label" }, "封面图片 URL", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.coverUrl = $event),
                  type: "url",
                  placeholder: "https://images.unsplash.com/...",
                  class: "modal-input"
                }, null, 512), [
                  [vModelText, form.value.coverUrl]
                ]),
                form.value.coverUrl ? (openBlock(), createElementBlock("div", _hoisted_36$1, [
                  createBaseVNode("img", {
                    src: form.value.coverUrl,
                    alt: "封面预览"
                  }, null, 8, _hoisted_37$1)
                ])) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_38$1, [
                createBaseVNode("div", _hoisted_39$1, [
                  _cache[26] || (_cache[26] = createBaseVNode("label", { class: "form-label" }, "在线体验链接 (Demo URL)", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.demoUrl = $event),
                    type: "url",
                    placeholder: "http://localhost:8080",
                    class: "modal-input"
                  }, null, 512), [
                    [vModelText, form.value.demoUrl]
                  ])
                ]),
                createBaseVNode("div", _hoisted_40$1, [
                  _cache[27] || (_cache[27] = createBaseVNode("label", { class: "form-label" }, "GitHub 开源仓库 URL", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.githubUrl = $event),
                    type: "url",
                    placeholder: "https://github.com/...",
                    class: "modal-input"
                  }, null, 512), [
                    [vModelText, form.value.githubUrl]
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_41$1, [
                createBaseVNode("button", {
                  type: "button",
                  class: "btn-cancel",
                  onClick: _cache[8] || (_cache[8] = ($event) => isModalOpen.value = false)
                }, "取消"),
                createBaseVNode("button", {
                  type: "submit",
                  class: "btn-save",
                  disabled: submitting.value
                }, toDisplayString(submitting.value ? "保存中…" : "确认保存作品"), 9, _hoisted_42$1)
              ])
            ], 32)
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const WorkManageView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a2ba8488"]]);
const _hoisted_1 = { class: "admin-console-page" };
const _hoisted_2 = { class: "console-topbar-card" };
const _hoisted_3 = { class: "console-nav-tabs" };
const _hoisted_4 = { class: "console-right-actions" };
const _hoisted_5 = { class: "admin-stats-grid" };
const _hoisted_6 = { class: "stat-number" };
const _hoisted_7 = { class: "admin-stat-card stat-cyan" };
const _hoisted_8 = { class: "stat-number" };
const _hoisted_9 = { class: "admin-stat-card stat-rose" };
const _hoisted_10 = { class: "stat-number" };
const _hoisted_11 = { class: "admin-stat-card stat-emerald" };
const _hoisted_12 = { class: "stat-number" };
const _hoisted_13 = { class: "console-body" };
const _hoisted_14 = { class: "work-toolbar" };
const _hoisted_15 = { class: "tab-pill-group" };
const _hoisted_16 = { class: "toolbar-actions" };
const _hoisted_17 = ["disabled"];
const _hoisted_18 = {
  key: 0,
  class: "crawl-spin"
};
const _hoisted_19 = { key: 1 };
const _hoisted_20 = {
  key: 0,
  class: "panel-section"
};
const _hoisted_21 = { class: "filter-bar" };
const _hoisted_22 = { class: "filter-pills" };
const _hoisted_23 = { class: "search-box" };
const _hoisted_24 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_25 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_26 = {
  key: 2,
  class: "candidates-grid"
};
const _hoisted_27 = { class: "card-header" };
const _hoisted_28 = { class: "source-tag" };
const _hoisted_29 = { class: "source-name" };
const _hoisted_30 = { class: "card-meta" };
const _hoisted_31 = { class: "meta-vendor" };
const _hoisted_32 = { class: "meta-model" };
const _hoisted_33 = { class: "meta-date" };
const _hoisted_34 = { class: "card-title" };
const _hoisted_35 = ["href"];
const _hoisted_36 = ["title"];
const _hoisted_37 = { class: "card-footer" };
const _hoisted_38 = { class: "seen-time" };
const _hoisted_39 = {
  key: 0,
  class: "action-buttons"
};
const _hoisted_40 = ["onClick"];
const _hoisted_41 = ["onClick"];
const _hoisted_42 = {
  key: 1,
  class: "reviewer-note"
};
const _hoisted_43 = { class: "note-text" };
const _hoisted_44 = {
  key: 1,
  class: "panel-section"
};
const _hoisted_45 = { class: "sources-card" };
const _hoisted_46 = { class: "sources-header" };
const _hoisted_47 = { class: "section-desc" };
const _hoisted_48 = { class: "last-check-badge" };
const _hoisted_49 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_50 = {
  key: 1,
  class: "table-responsive"
};
const _hoisted_51 = { class: "sources-table" };
const _hoisted_52 = { class: "source-url-col" };
const _hoisted_53 = ["href"];
const _hoisted_54 = { class: "type-tag" };
const _hoisted_55 = { class: "time-col" };
const _hoisted_56 = { class: "error-col" };
const _hoisted_57 = ["title"];
const _hoisted_58 = {
  key: 1,
  class: "no-error"
};
const _hoisted_59 = ["onClick"];
const _hoisted_60 = {
  key: 2,
  class: "panel-section"
};
const _hoisted_61 = { class: "sources-card" };
const _hoisted_62 = { class: "sources-header" };
const _hoisted_63 = ["disabled"];
const _hoisted_64 = { class: "backfill-config-grid" };
const _hoisted_65 = { class: "config-col" };
const _hoisted_66 = { class: "config-col" };
const _hoisted_67 = { class: "config-col checkbox-col" };
const _hoisted_68 = { class: "checkbox-label" };
const _hoisted_69 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_70 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_71 = {
  key: 2,
  class: "backfill-list"
};
const _hoisted_72 = { class: "job-header" };
const _hoisted_73 = { class: "job-id" };
const _hoisted_74 = { class: "job-meta" };
const _hoisted_75 = {
  key: 0,
  class: "coverage-gaps-box"
};
const _hoisted_76 = { class: "job-logs-box" };
const _hoisted_77 = {
  class: "coverage-matrix-container",
  style: { "margin-top": "32px" }
};
const _hoisted_78 = {
  key: 0,
  class: "loading-state"
};
const _hoisted_79 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_80 = {
  key: 2,
  class: "table-responsive"
};
const _hoisted_81 = { class: "sources-table" };
const _hoisted_82 = { class: "error-col" };
const _hoisted_83 = ["title"];
const _hoisted_84 = { class: "modal-box" };
const _hoisted_85 = { class: "modal-header" };
const _hoisted_86 = { class: "modal-body" };
const _hoisted_87 = { class: "form-row" };
const _hoisted_88 = ["value"];
const _hoisted_89 = { class: "form-row-2" };
const _hoisted_90 = { class: "form-col" };
const _hoisted_91 = { class: "form-col" };
const _hoisted_92 = { class: "form-row-3" };
const _hoisted_93 = { class: "form-col" };
const _hoisted_94 = { class: "form-col" };
const _hoisted_95 = { class: "form-col" };
const _hoisted_96 = { class: "form-row" };
const _hoisted_97 = { class: "form-row" };
const _hoisted_98 = { class: "evidence-preview" };
const _hoisted_99 = ["href"];
const _hoisted_100 = { class: "modal-footer" };
const _sfc_main = {
  __name: "ModelsAdminView",
  setup(__props) {
    const router2 = useRouter();
    const currentTab = /* @__PURE__ */ ref("candidates");
    const stats = /* @__PURE__ */ ref({
      pendingCount: 0,
      activeSources: 0,
      abnormalSources: 0,
      totalEvents: 0,
      lastCheckTime: "—"
    });
    const candidates = /* @__PURE__ */ ref([]);
    const totalCandidates = /* @__PURE__ */ ref(0);
    const candPage = /* @__PURE__ */ ref(1);
    const candSize = /* @__PURE__ */ ref(8);
    const candTotalPages = /* @__PURE__ */ ref(1);
    const candStatusFilter = /* @__PURE__ */ ref("PENDING");
    const candKeyword = /* @__PURE__ */ ref("");
    const loadingCandidates = /* @__PURE__ */ ref(false);
    const showApproveModal = /* @__PURE__ */ ref(false);
    const currentCandidate = /* @__PURE__ */ ref(null);
    const approveForm = /* @__PURE__ */ ref({
      vendorId: 1,
      modelKey: "",
      displayName: "",
      series: "",
      version: "1.0",
      modalities: "文本,混合推理",
      availabilityStatus: "API_ONLY",
      eventType: "MODEL_RELEASE",
      stage: "正式发布",
      releaseDate: "",
      summary: "",
      reviewerNote: "经核实官方公告无误，准予发布"
    });
    const vendors = /* @__PURE__ */ ref([]);
    const sources = /* @__PURE__ */ ref([]);
    const loadingSources = /* @__PURE__ */ ref(false);
    const crawling = /* @__PURE__ */ ref(false);
    const crawlResult = /* @__PURE__ */ ref(null);
    async function loadStats() {
      try {
        const data = await aiApi.getStatus();
        if (data) {
          stats.value = {
            pendingCount: data.pendingCandidates || 0,
            activeSources: data.activeSources || 0,
            abnormalSources: data.abnormalSources || 0,
            totalEvents: data.totalEvents || 0,
            lastCheckTime: data.lastCheckTime || "—"
          };
        }
      } catch (e) {
        console.error("获取监控统计失败", e);
      }
    }
    async function loadVendors() {
      try {
        const data = await aiApi.getVendors();
        vendors.value = data || [];
      } catch (e) {
        console.error("加载厂商列表失败", e);
      }
    }
    async function loadCandidates() {
      loadingCandidates.value = true;
      try {
        const res = await aiApi.getCandidates({
          status: candStatusFilter.value,
          keyword: candKeyword.value,
          page: candPage.value,
          size: candSize.value
        });
        candidates.value = res.list || [];
        totalCandidates.value = res.total || 0;
        candTotalPages.value = res.totalPages || 1;
      } catch (e) {
        console.error("获取候选列表异常", e);
      } finally {
        loadingCandidates.value = false;
      }
    }
    async function loadSources() {
      loadingSources.value = true;
      try {
        const data = await aiApi.getAdminSources();
        sources.value = data || [];
      } catch (e) {
        console.error("获取信源列表异常", e);
      } finally {
        loadingSources.value = false;
      }
    }
    const backfills = /* @__PURE__ */ ref([]);
    const loadingBackfills = /* @__PURE__ */ ref(false);
    const backfillForm = /* @__PURE__ */ ref({
      startDate: "2026-01-01",
      endDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      dryRun: false
    });
    const startingBackfill = /* @__PURE__ */ ref(false);
    async function loadBackfills() {
      loadingBackfills.value = true;
      try {
        const data = await aiApi.listBackfills();
        backfills.value = data || [];
      } catch (e) {
        console.error("获取回填任务失败", e);
      } finally {
        loadingBackfills.value = false;
      }
    }
    const coverageAudits = /* @__PURE__ */ ref([]);
    const loadingCoverage = /* @__PURE__ */ ref(false);
    async function loadCoverageAudits() {
      loadingCoverage.value = true;
      try {
        const data = await aiApi.getCoverage({ year: "2026" });
        coverageAudits.value = data || [];
      } catch (e) {
        console.error("获取覆盖审计失败", e);
      } finally {
        loadingCoverage.value = false;
      }
    }
    async function handleCreateBackfill() {
      startingBackfill.value = true;
      try {
        await aiApi.createBackfill(backfillForm.value);
        alert("已成功创建后台回填任务，正在按月扫描推进...");
        await loadBackfills();
        await loadCoverageAudits();
      } catch (e) {
        alert("创建回填任务失败: " + e.message);
      } finally {
        startingBackfill.value = false;
      }
    }
    function handleTabChange(tab) {
      currentTab.value = tab;
      if (tab === "candidates") {
        loadCandidates();
      } else if (tab === "sources") {
        loadSources();
      } else if (tab === "backfills") {
        loadBackfills();
        loadCoverageAudits();
      }
    }
    function handleStatusFilter(status) {
      candStatusFilter.value = status;
      candPage.value = 1;
      loadCandidates();
    }
    function handleSearch() {
      candPage.value = 1;
      loadCandidates();
    }
    function openApproveModal(cand) {
      currentCandidate.value = cand;
      let matchedVendor = vendors.value.find(
        (v) => cand.guessVendorName && v.name.toLowerCase().includes(cand.guessVendorName.toLowerCase())
      );
      if (!matchedVendor && vendors.value.length > 0) {
        matchedVendor = vendors.value[0];
      }
      let key = (cand.guessModelName || cand.rawTitle || "model").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      approveForm.value = {
        vendorId: matchedVendor ? matchedVendor.id : 1,
        modelKey: key,
        displayName: cand.guessModelName || cand.rawTitle,
        series: cand.guessModelName ? cand.guessModelName.split(" ")[0] : "Foundation",
        version: "1.0",
        modalities: "文本,混合推理",
        availabilityStatus: "API_ONLY",
        eventType: "MODEL_RELEASE",
        stage: "正式发布",
        releaseDate: cand.upstreamDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        summary: cand.rawSummary || cand.rawTitle,
        reviewerNote: "经核验官方公告确凿，确认发布"
      };
      showApproveModal.value = true;
    }
    async function submitApprove() {
      if (!approveForm.value.modelKey) {
        alert("请填写模型规范标识 (modelKey)");
        return;
      }
      if (!approveForm.value.releaseDate) {
        alert("请填写官方发布日期");
        return;
      }
      try {
        await aiApi.decideCandidate(currentCandidate.value.id, {
          action: "APPROVE",
          ...approveForm.value
        });
        alert("审核通过！该事件已转正并发布到公开监控主页。");
        showApproveModal.value = false;
        loadStats();
        loadCandidates();
      } catch (e) {
        alert("审核操作失败: " + e.message);
      }
    }
    async function handleReject(cand) {
      const reason = prompt("请输入驳回该候选的原因批注：", "非模型发布公告或缺乏官方确切证据");
      if (reason === null) return;
      try {
        await aiApi.decideCandidate(cand.id, {
          action: "REJECT",
          reviewerNote: reason
        });
        alert("已成功驳回该候选条目");
        loadStats();
        loadCandidates();
      } catch (e) {
        alert("驳回失败: " + e.message);
      }
    }
    async function handleToggleSource(source) {
      const targetActive = !source.is_active;
      try {
        await aiApi.toggleSource(source.id, targetActive);
        source.is_active = targetActive ? 1 : 0;
      } catch (e) {
        alert("修改信源状态失败: " + e.message);
      }
    }
    async function handleTriggerCrawl() {
      if (crawling.value) return;
      crawling.value = true;
      crawlResult.value = null;
      try {
        const res = await aiApi.triggerAdminCrawl();
        crawlResult.value = res;
        alert(`巡检完成！耗时 ${res.durationMs || 0}ms，解析条目 ${res.parsedItems || 0}，新增候选 ${res.newCandidates || 0}`);
        loadStats();
        if (currentTab.value === "candidates") loadCandidates();
        if (currentTab.value === "sources") loadSources();
      } catch (e) {
        alert("巡检触发失败: " + e.message);
      } finally {
        crawling.value = false;
      }
    }
    function handleLogout() {
      if (confirm("确定要退出管理员登录吗？")) {
        authApi.logout();
        router2.push("/");
      }
    }
    onMounted(() => {
      loadStats();
      loadVendors();
      loadCandidates();
    });
    return (_ctx, _cache) => {
      var _a, _b;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("header", _hoisted_2, [
          _cache[29] || (_cache[29] = createStaticVNode('<div class="console-brand" data-v-eb686d94><div class="console-shield-badge" data-v-eb686d94>🛰️</div><div class="console-brand-text" data-v-eb686d94><span class="console-title" data-v-eb686d94>模型监控管理控制台</span><span class="console-runtime-badge" data-v-eb686d94>数据闭环 · 审核转正 · 信源状态</span></div></div>', 1)),
          createBaseVNode("nav", _hoisted_3, [
            createVNode(_component_router_link, {
              to: "/admin/models",
              class: "console-tab-item active"
            }, {
              default: withCtx(() => [..._cache[23] || (_cache[23] = [
                createTextVNode(" 🤖 模型监控审核 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[24] || (_cache[24] = [
                createTextVNode(" 📝 博文管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/works",
              class: "console-tab-item"
            }, {
              default: withCtx(() => [..._cache[25] || (_cache[25] = [
                createTextVNode(" 🛠️ 作品管理 ", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_router_link, {
              to: "/admin/articles/new",
              class: "console-tab-item create-tab"
            }, {
              default: withCtx(() => [..._cache[26] || (_cache[26] = [
                createTextVNode(" ✍️ 撰写新博文 ", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_4, [
            _cache[28] || (_cache[28] = createBaseVNode("span", { class: "admin-user-pill" }, "👤 admin", -1)),
            createVNode(_component_router_link, {
              to: "/",
              target: "_blank",
              class: "preview-front-btn",
              title: "在新标签页预览前台"
            }, {
              default: withCtx(() => [..._cache[27] || (_cache[27] = [
                createTextVNode(" ↗ 前台监控 ", -1)
              ])]),
              _: 1
            }),
            createBaseVNode("button", {
              class: "console-logout-btn",
              title: "安全退出登录",
              onClick: handleLogout
            }, " 登出 ")
          ])
        ]),
        createBaseVNode("section", _hoisted_5, [
          createBaseVNode("div", {
            class: normalizeClass(["admin-stat-card stat-amber", { "has-pending": stats.value.pendingCount > 0 }])
          }, [
            _cache[30] || (_cache[30] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "⏳"),
              createBaseVNode("span", { class: "stat-tag" }, "REVIEW QUEUE")
            ], -1)),
            createBaseVNode("div", _hoisted_6, toDisplayString(stats.value.pendingCount), 1),
            _cache[31] || (_cache[31] = createBaseVNode("div", { class: "stat-label" }, "待审核候选条目", -1))
          ], 2),
          createBaseVNode("div", _hoisted_7, [
            _cache[32] || (_cache[32] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "📡"),
              createBaseVNode("span", { class: "stat-tag" }, "ACTIVE FEEDS")
            ], -1)),
            createBaseVNode("div", _hoisted_8, toDisplayString(stats.value.activeSources), 1),
            _cache[33] || (_cache[33] = createBaseVNode("div", { class: "stat-label" }, "已启用监控信源", -1))
          ]),
          createBaseVNode("div", _hoisted_9, [
            _cache[34] || (_cache[34] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "⚠️"),
              createBaseVNode("span", { class: "stat-tag" }, "FEED ISSUES")
            ], -1)),
            createBaseVNode("div", _hoisted_10, toDisplayString(stats.value.abnormalSources), 1),
            _cache[35] || (_cache[35] = createBaseVNode("div", { class: "stat-label" }, "异常连接信源", -1))
          ]),
          createBaseVNode("div", _hoisted_11, [
            _cache[36] || (_cache[36] = createBaseVNode("div", { class: "stat-top" }, [
              createBaseVNode("span", { class: "stat-icon" }, "🛡️"),
              createBaseVNode("span", { class: "stat-tag" }, "CONFIRMED EVENTS")
            ], -1)),
            createBaseVNode("div", _hoisted_12, toDisplayString(stats.value.totalEvents), 1),
            _cache[37] || (_cache[37] = createBaseVNode("div", { class: "stat-label" }, "公开已核实事件", -1))
          ])
        ]),
        createBaseVNode("main", _hoisted_13, [
          createBaseVNode("div", _hoisted_14, [
            createBaseVNode("div", _hoisted_15, [
              createBaseVNode("button", {
                class: normalizeClass(["tab-pill-btn", { active: currentTab.value === "candidates" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => handleTabChange("candidates"))
              }, " 📋 候选审核队列 (" + toDisplayString(stats.value.pendingCount) + ") ", 3),
              createBaseVNode("button", {
                class: normalizeClass(["tab-pill-btn", { active: currentTab.value === "sources" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => handleTabChange("sources"))
              }, " 🛰️ 官方信源状态 (" + toDisplayString(sources.value.length || stats.value.activeSources) + ") ", 3),
              createBaseVNode("button", {
                class: normalizeClass(["tab-pill-btn", { active: currentTab.value === "backfills" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => handleTabChange("backfills"))
              }, " ⏳ 2026 历史回填 ", 2)
            ]),
            createBaseVNode("div", _hoisted_16, [
              createBaseVNode("button", {
                class: "crawl-trigger-btn",
                disabled: crawling.value,
                onClick: handleTriggerCrawl
              }, [
                crawling.value ? (openBlock(), createElementBlock("span", _hoisted_18, "🔄")) : (openBlock(), createElementBlock("span", _hoisted_19, "🚀")),
                createTextVNode(" " + toDisplayString(crawling.value ? "正在执行全量抓取与解析..." : "立即执行全量巡检"), 1)
              ], 8, _hoisted_17)
            ])
          ]),
          currentTab.value === "candidates" ? (openBlock(), createElementBlock("section", _hoisted_20, [
            createBaseVNode("div", _hoisted_21, [
              createBaseVNode("div", _hoisted_22, [
                createBaseVNode("button", {
                  class: normalizeClass(["pill-btn", { active: candStatusFilter.value === "PENDING" }]),
                  onClick: _cache[3] || (_cache[3] = ($event) => handleStatusFilter("PENDING"))
                }, "待审核 (" + toDisplayString(stats.value.pendingCount) + ")", 3),
                createBaseVNode("button", {
                  class: normalizeClass(["pill-btn", { active: candStatusFilter.value === "CONFIRMED" }]),
                  onClick: _cache[4] || (_cache[4] = ($event) => handleStatusFilter("CONFIRMED"))
                }, "已转正", 2),
                createBaseVNode("button", {
                  class: normalizeClass(["pill-btn", { active: candStatusFilter.value === "REJECTED" }]),
                  onClick: _cache[5] || (_cache[5] = ($event) => handleStatusFilter("REJECTED"))
                }, "已驳回", 2),
                createBaseVNode("button", {
                  class: normalizeClass(["pill-btn", { active: candStatusFilter.value === "ALL" }]),
                  onClick: _cache[6] || (_cache[6] = ($event) => handleStatusFilter("ALL"))
                }, "全部", 2)
              ]),
              createBaseVNode("div", _hoisted_23, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => candKeyword.value = $event),
                  type: "text",
                  placeholder: "搜索标题、模型名或厂商...",
                  onKeyup: withKeys(handleSearch, ["enter"])
                }, null, 544), [
                  [vModelText, candKeyword.value]
                ]),
                createBaseVNode("button", {
                  class: "search-btn",
                  onClick: handleSearch
                }, "🔍 检索")
              ])
            ]),
            loadingCandidates.value ? (openBlock(), createElementBlock("div", _hoisted_24, [..._cache[38] || (_cache[38] = [
              createBaseVNode("div", { class: "spinner" }, null, -1),
              createBaseVNode("p", null, "正在读取候选消息队列...", -1)
            ])])) : candidates.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_25, [..._cache[39] || (_cache[39] = [
              createBaseVNode("span", { class: "empty-icon" }, "📭", -1),
              createBaseVNode("h4", null, "当前队列暂无候选记录", -1),
              createBaseVNode("p", null, "官方信源巡检发现包含模型关键词的新动态后，将自动推送至本待审工作台。", -1)
            ])])) : (openBlock(), createElementBlock("div", _hoisted_26, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(candidates.value, (cand) => {
                return openBlock(), createElementBlock("div", {
                  key: cand.id,
                  class: normalizeClass(["candidate-card", "card-" + cand.status.toLowerCase()])
                }, [
                  createBaseVNode("div", _hoisted_27, [
                    createBaseVNode("div", _hoisted_28, [
                      _cache[40] || (_cache[40] = createBaseVNode("span", { class: "source-icon" }, "📡", -1)),
                      createBaseVNode("span", _hoisted_29, toDisplayString(cand.sourceName), 1)
                    ]),
                    createBaseVNode("div", {
                      class: normalizeClass(["status-pill", "pill-" + cand.status.toLowerCase()])
                    }, toDisplayString(cand.status === "PENDING" ? "待审核" : cand.status === "CONFIRMED" ? "已转正" : "已驳回"), 3)
                  ]),
                  createBaseVNode("div", _hoisted_30, [
                    createBaseVNode("span", _hoisted_31, [
                      _cache[41] || (_cache[41] = createTextVNode("推断厂商: ", -1)),
                      createBaseVNode("strong", null, toDisplayString(cand.guessVendorName || "未知"), 1)
                    ]),
                    _cache[43] || (_cache[43] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                    createBaseVNode("span", _hoisted_32, [
                      _cache[42] || (_cache[42] = createTextVNode("推断模型: ", -1)),
                      createBaseVNode("strong", null, toDisplayString(cand.guessModelName || "待提取"), 1)
                    ]),
                    _cache[44] || (_cache[44] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                    createBaseVNode("span", _hoisted_33, "发布: " + toDisplayString(cand.upstreamDate || "待核实"), 1)
                  ]),
                  createBaseVNode("h3", _hoisted_34, [
                    createBaseVNode("a", {
                      href: cand.evidenceUrl,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      title: "查看官方公告原文"
                    }, toDisplayString(cand.rawTitle) + " ↗ ", 9, _hoisted_35)
                  ]),
                  createBaseVNode("p", {
                    class: "card-summary",
                    title: cand.rawSummary
                  }, toDisplayString(cand.rawSummary || "暂无抓取摘要文本"), 9, _hoisted_36),
                  createBaseVNode("div", _hoisted_37, [
                    createBaseVNode("span", _hoisted_38, "发现于 " + toDisplayString(cand.firstSeenAt), 1),
                    cand.status === "PENDING" ? (openBlock(), createElementBlock("div", _hoisted_39, [
                      createBaseVNode("button", {
                        class: "btn-approve",
                        onClick: ($event) => openApproveModal(cand)
                      }, " ✓ 审核通过并转正 ", 8, _hoisted_40),
                      createBaseVNode("button", {
                        class: "btn-reject",
                        onClick: ($event) => handleReject(cand)
                      }, " ✕ 驳回 ", 8, _hoisted_41)
                    ])) : (openBlock(), createElementBlock("div", _hoisted_42, [
                      _cache[45] || (_cache[45] = createBaseVNode("span", { class: "note-label" }, "审核批注:", -1)),
                      createBaseVNode("span", _hoisted_43, toDisplayString(cand.reviewerNote || "无"), 1)
                    ]))
                  ])
                ], 2);
              }), 128))
            ])),
            candTotalPages.value > 1 ? (openBlock(), createBlock(Pagination, {
              key: 3,
              current: candPage.value,
              total: candTotalPages.value,
              onChange: _cache[8] || (_cache[8] = (p2) => {
                candPage.value = p2;
                loadCandidates();
              })
            }, null, 8, ["current", "total"])) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          currentTab.value === "sources" ? (openBlock(), createElementBlock("section", _hoisted_44, [
            createBaseVNode("div", _hoisted_45, [
              createBaseVNode("div", _hoisted_46, [
                createBaseVNode("div", null, [
                  _cache[46] || (_cache[46] = createBaseVNode("h3", null, "全量官方来源巡检状态与健康度", -1)),
                  createBaseVNode("p", _hoisted_47, "已登记 " + toDisplayString(sources.value.length) + " 条官方信源。系统通过防 XXE 标准 DOM 解析 XML 订阅与 HTML 官方发布页。", 1)
                ]),
                createBaseVNode("div", _hoisted_48, " 最近检查: " + toDisplayString(stats.value.lastCheckTime), 1)
              ]),
              loadingSources.value ? (openBlock(), createElementBlock("div", _hoisted_49, [..._cache[47] || (_cache[47] = [
                createBaseVNode("div", { class: "spinner" }, null, -1),
                createBaseVNode("p", null, "正在拉取信源状态...", -1)
              ])])) : (openBlock(), createElementBlock("div", _hoisted_50, [
                createBaseVNode("table", _hoisted_51, [
                  _cache[48] || (_cache[48] = createBaseVNode("thead", null, [
                    createBaseVNode("tr", null, [
                      createBaseVNode("th", null, "ID"),
                      createBaseVNode("th", null, "所属厂商"),
                      createBaseVNode("th", null, "信源 URL 与类型"),
                      createBaseVNode("th", null, "状态"),
                      createBaseVNode("th", null, "最近成功"),
                      createBaseVNode("th", null, "异常排查"),
                      createBaseVNode("th", null, "操作")
                    ])
                  ], -1)),
                  createBaseVNode("tbody", null, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(sources.value, (s) => {
                      return openBlock(), createElementBlock("tr", {
                        key: s.id
                      }, [
                        createBaseVNode("td", null, "#" + toDisplayString(s.id), 1),
                        createBaseVNode("td", null, [
                          createBaseVNode("span", {
                            class: "vendor-badge",
                            style: normalizeStyle({ borderColor: s.brand_color, color: s.brand_color })
                          }, toDisplayString(s.vendor_name), 5)
                        ]),
                        createBaseVNode("td", null, [
                          createBaseVNode("div", _hoisted_52, [
                            createBaseVNode("a", {
                              href: s.source_url,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              class: "source-link"
                            }, toDisplayString(s.source_url) + " ↗ ", 9, _hoisted_53),
                            createBaseVNode("span", _hoisted_54, toDisplayString(s.source_type), 1)
                          ])
                        ]),
                        createBaseVNode("td", null, [
                          createBaseVNode("span", {
                            class: normalizeClass(["health-pill", { "healthy": s.failure_count === 0, "faulty": s.failure_count > 0 }])
                          }, toDisplayString(s.failure_count === 0 ? "● 正常" : "▲ 失败 " + s.failure_count + "次"), 3)
                        ]),
                        createBaseVNode("td", _hoisted_55, toDisplayString(s.last_success_time || s.last_success_at || "尚无成功记录"), 1),
                        createBaseVNode("td", _hoisted_56, [
                          s.last_error ? (openBlock(), createElementBlock("span", {
                            key: 0,
                            class: "error-text",
                            title: s.last_error
                          }, toDisplayString(s.last_error), 9, _hoisted_57)) : (openBlock(), createElementBlock("span", _hoisted_58, "—"))
                        ]),
                        createBaseVNode("td", null, [
                          createBaseVNode("button", {
                            class: normalizeClass(["toggle-btn", { "btn-on": s.is_active, "btn-off": !s.is_active }]),
                            onClick: ($event) => handleToggleSource(s)
                          }, toDisplayString(s.is_active ? "已启用" : "已停用"), 11, _hoisted_59)
                        ])
                      ]);
                    }), 128))
                  ])
                ])
              ]))
            ])
          ])) : createCommentVNode("", true),
          currentTab.value === "backfills" ? (openBlock(), createElementBlock("section", _hoisted_60, [
            createBaseVNode("div", _hoisted_61, [
              createBaseVNode("div", _hoisted_62, [
                _cache[49] || (_cache[49] = createBaseVNode("div", null, [
                  createBaseVNode("h3", null, "2026 年官方发布历史回填与覆盖审计"),
                  createBaseVNode("p", { class: "section-desc" }, "从 2026-01-01 起按厂商与月份深入官方归档追溯历史模型，生成可核验已核实发布记录并识别覆盖缺口。")
                ], -1)),
                createBaseVNode("button", {
                  class: "crawl-trigger-btn",
                  disabled: startingBackfill.value,
                  onClick: handleCreateBackfill
                }, [
                  createBaseVNode("span", null, toDisplayString(startingBackfill.value ? "⏳ 启动中..." : "▶ 发起历史回填任务"), 1)
                ], 8, _hoisted_63)
              ]),
              createBaseVNode("div", _hoisted_64, [
                createBaseVNode("div", _hoisted_65, [
                  _cache[50] || (_cache[50] = createBaseVNode("label", null, "回填起始日期", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => backfillForm.value.startDate = $event),
                    type: "date"
                  }, null, 512), [
                    [vModelText, backfillForm.value.startDate]
                  ])
                ]),
                createBaseVNode("div", _hoisted_66, [
                  _cache[51] || (_cache[51] = createBaseVNode("label", null, "回填截止日期", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => backfillForm.value.endDate = $event),
                    type: "date"
                  }, null, 512), [
                    [vModelText, backfillForm.value.endDate]
                  ])
                ]),
                createBaseVNode("div", _hoisted_67, [
                  createBaseVNode("label", _hoisted_68, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => backfillForm.value.dryRun = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, backfillForm.value.dryRun]
                    ]),
                    _cache[52] || (_cache[52] = createTextVNode(" 仅试跑 (Dry-Run 模式，不正式入库) ", -1))
                  ])
                ])
              ]),
              loadingBackfills.value ? (openBlock(), createElementBlock("div", _hoisted_69, [..._cache[53] || (_cache[53] = [
                createBaseVNode("div", { class: "spinner" }, null, -1),
                createBaseVNode("p", null, "正在读取历史回填任务记录...", -1)
              ])])) : backfills.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_70, [..._cache[54] || (_cache[54] = [
                createBaseVNode("span", { class: "empty-icon" }, "⏳", -1),
                createBaseVNode("h4", null, "暂无正在运行或已完成的历史回填任务", -1),
                createBaseVNode("p", null, "点击上方“发起历史回填任务”，系统将通过异步虚拟线程扫描已登记官方渠道并记录月份覆盖状态。", -1)
              ])])) : (openBlock(), createElementBlock("div", _hoisted_71, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(backfills.value, (job) => {
                  return openBlock(), createElementBlock("div", {
                    key: job.jobId,
                    class: "backfill-job-card"
                  }, [
                    createBaseVNode("div", _hoisted_72, [
                      createBaseVNode("span", _hoisted_73, "任务编号: " + toDisplayString(job.jobId), 1),
                      createBaseVNode("span", {
                        class: normalizeClass(["job-status-pill", "status-" + job.status.toLowerCase()])
                      }, toDisplayString(job.status === "COMPLETED" ? "✓ 已完成" : job.status === "RUNNING" ? "⏳ 正在回填..." : "✕ 失败"), 3)
                    ]),
                    createBaseVNode("div", _hoisted_74, [
                      createBaseVNode("span", null, "范围: " + toDisplayString(job.startDate) + " 至 " + toDisplayString(job.endDate), 1),
                      _cache[55] || (_cache[55] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                      createBaseVNode("span", null, "处理信源: " + toDisplayString(job.sourcesProcessed) + " 条", 1),
                      _cache[56] || (_cache[56] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                      createBaseVNode("span", null, "发现候选: " + toDisplayString(job.candidatesFound) + " 个", 1),
                      _cache[57] || (_cache[57] = createBaseVNode("span", { class: "meta-sep" }, "·", -1)),
                      createBaseVNode("span", null, "匹配已核实: " + toDisplayString(job.confirmedEvents) + " 条", 1)
                    ]),
                    job.coverageGaps && job.coverageGaps.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_75, [
                      _cache[58] || (_cache[58] = createBaseVNode("div", { class: "gap-title" }, "⚠️ 来源覆盖缺口与审计提示：", -1)),
                      createBaseVNode("ul", null, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(job.coverageGaps, (gap, idx) => {
                          return openBlock(), createElementBlock("li", { key: idx }, toDisplayString(gap), 1);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true),
                    createBaseVNode("div", _hoisted_76, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(job.logs, (log, idx) => {
                        return openBlock(), createElementBlock("div", {
                          class: "log-line",
                          key: idx
                        }, " [" + toDisplayString(job.startTime) + "] " + toDisplayString(log), 1);
                      }), 128))
                    ])
                  ]);
                }), 128))
              ])),
              createBaseVNode("div", _hoisted_77, [
                _cache[62] || (_cache[62] = createBaseVNode("div", {
                  class: "matrix-header",
                  style: { "margin-bottom": "14px", "display": "flex", "justify-content": "space-between", "align-items": "baseline" }
                }, [
                  createBaseVNode("h4", { style: { "margin": "0", "font-size": "15px", "color": "#103443" } }, "📊 2026 各月厂商官方覆盖审计矩阵"),
                  createBaseVNode("span", {
                    class: "matrix-sub",
                    style: { "font-size": "12px", "color": "rgba(16, 52, 67, 0.65)" }
                  }, "全量覆盖 (FULL) / 部分覆盖 (PARTIAL) / 缺口审计")
                ], -1)),
                loadingCoverage.value ? (openBlock(), createElementBlock("div", _hoisted_78, [..._cache[59] || (_cache[59] = [
                  createBaseVNode("div", { class: "spinner" }, null, -1),
                  createBaseVNode("p", null, "正在读取覆盖审计矩阵...", -1)
                ])])) : coverageAudits.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_79, [..._cache[60] || (_cache[60] = [
                  createBaseVNode("p", null, "暂无覆盖审计数据，请先发起历史回填任务生成。", -1)
                ])])) : (openBlock(), createElementBlock("div", _hoisted_80, [
                  createBaseVNode("table", _hoisted_81, [
                    _cache[61] || (_cache[61] = createBaseVNode("thead", null, [
                      createBaseVNode("tr", null, [
                        createBaseVNode("th", null, "厂商"),
                        createBaseVNode("th", null, "月份"),
                        createBaseVNode("th", null, "覆盖状态"),
                        createBaseVNode("th", null, "最早条目"),
                        createBaseVNode("th", null, "最晚条目"),
                        createBaseVNode("th", null, "审计说明 / 覆盖缺口")
                      ])
                    ], -1)),
                    createBaseVNode("tbody", null, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(coverageAudits.value, (cov) => {
                        return openBlock(), createElementBlock("tr", {
                          key: cov.vendorId + "-" + cov.coverageMonth
                        }, [
                          createBaseVNode("td", null, [
                            createBaseVNode("span", {
                              class: "vendor-badge",
                              style: normalizeStyle({ borderColor: cov.brandColor, color: cov.brandColor })
                            }, toDisplayString(cov.vendorName), 5)
                          ]),
                          createBaseVNode("td", null, [
                            createBaseVNode("strong", null, toDisplayString(cov.coverageMonth), 1)
                          ]),
                          createBaseVNode("td", null, [
                            createBaseVNode("span", {
                              class: normalizeClass(["health-pill", { "healthy": cov.status === "FULL", "faulty": cov.status !== "FULL" }])
                            }, toDisplayString(cov.status === "FULL" ? "● 已扫完 (FULL)" : "▲ 部分覆盖 (PARTIAL)"), 3)
                          ]),
                          createBaseVNode("td", null, toDisplayString(cov.earliestItemDate || "—"), 1),
                          createBaseVNode("td", null, toDisplayString(cov.latestItemDate || "—"), 1),
                          createBaseVNode("td", _hoisted_82, [
                            createBaseVNode("span", {
                              title: cov.gapNotes
                            }, toDisplayString(cov.gapNotes || "正常扫描"), 9, _hoisted_83)
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ]))
              ])
            ])
          ])) : createCommentVNode("", true)
        ]),
        showApproveModal.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "modal-backdrop",
          onClick: _cache[22] || (_cache[22] = withModifiers(($event) => showApproveModal.value = false, ["self"]))
        }, [
          createBaseVNode("div", _hoisted_84, [
            createBaseVNode("div", _hoisted_85, [
              _cache[63] || (_cache[63] = createBaseVNode("h3", null, "✅ 候选审核确认并转正为公开事件", -1)),
              createBaseVNode("button", {
                class: "close-btn",
                onClick: _cache[12] || (_cache[12] = ($event) => showApproveModal.value = false)
              }, "✕")
            ]),
            createBaseVNode("div", _hoisted_86, [
              createBaseVNode("div", _hoisted_87, [
                _cache[64] || (_cache[64] = createBaseVNode("label", null, "所属厂商 *", -1)),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => approveForm.value.vendorId = $event)
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(vendors.value, (v) => {
                    return openBlock(), createElementBlock("option", {
                      key: v.id,
                      value: v.id
                    }, toDisplayString(v.name) + " (" + toDisplayString(v.slug) + ")", 9, _hoisted_88);
                  }), 128))
                ], 512), [
                  [vModelSelect, approveForm.value.vendorId]
                ])
              ]),
              createBaseVNode("div", _hoisted_89, [
                createBaseVNode("div", _hoisted_90, [
                  _cache[65] || (_cache[65] = createBaseVNode("label", null, "模型唯一键 (modelKey) *", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => approveForm.value.modelKey = $event),
                    placeholder: "例如: gpt-5-preview"
                  }, null, 512), [
                    [vModelText, approveForm.value.modelKey]
                  ])
                ]),
                createBaseVNode("div", _hoisted_91, [
                  _cache[66] || (_cache[66] = createBaseVNode("label", null, "展示名称 *", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => approveForm.value.displayName = $event),
                    placeholder: "例如: GPT-5 Preview"
                  }, null, 512), [
                    [vModelText, approveForm.value.displayName]
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_92, [
                createBaseVNode("div", _hoisted_93, [
                  _cache[68] || (_cache[68] = createBaseVNode("label", null, "事件类型 *", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => approveForm.value.eventType = $event)
                  }, [..._cache[67] || (_cache[67] = [
                    createBaseVNode("option", { value: "MODEL_RELEASE" }, "模型正式发布", -1),
                    createBaseVNode("option", { value: "WEIGHTS_RELEASE" }, "模型权重开源", -1),
                    createBaseVNode("option", { value: "VERSION_UPDATE" }, "版本大升级", -1),
                    createBaseVNode("option", { value: "API_AVAILABLE" }, "开放 API 准入", -1)
                  ])], 512), [
                    [vModelSelect, approveForm.value.eventType]
                  ])
                ]),
                createBaseVNode("div", _hoisted_94, [
                  _cache[69] || (_cache[69] = createBaseVNode("label", null, "官方发布日期 *", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => approveForm.value.releaseDate = $event),
                    type: "date"
                  }, null, 512), [
                    [vModelText, approveForm.value.releaseDate]
                  ])
                ]),
                createBaseVNode("div", _hoisted_95, [
                  _cache[71] || (_cache[71] = createBaseVNode("label", null, "开放形态 *", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => approveForm.value.availabilityStatus = $event)
                  }, [..._cache[70] || (_cache[70] = [
                    createBaseVNode("option", { value: "API_ONLY" }, "仅 API / 云服务", -1),
                    createBaseVNode("option", { value: "WEIGHTS_OPEN" }, "权重开源可用", -1),
                    createBaseVNode("option", { value: "CLOSED" }, "内部闭源", -1)
                  ])], 512), [
                    [vModelSelect, approveForm.value.availabilityStatus]
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_96, [
                _cache[72] || (_cache[72] = createBaseVNode("label", null, "事件摘要描述 *", -1)),
                withDirectives(createBaseVNode("textarea", {
                  "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => approveForm.value.summary = $event),
                  rows: "3",
                  placeholder: "清晰提炼模型技术特性与影响"
                }, null, 512), [
                  [vModelText, approveForm.value.summary]
                ])
              ]),
              createBaseVNode("div", _hoisted_97, [
                _cache[73] || (_cache[73] = createBaseVNode("label", null, "审核操作批注", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => approveForm.value.reviewerNote = $event),
                  placeholder: "审核留痕批注"
                }, null, 512), [
                  [vModelText, approveForm.value.reviewerNote]
                ])
              ]),
              createBaseVNode("div", _hoisted_98, [
                _cache[74] || (_cache[74] = createBaseVNode("span", { class: "preview-label" }, "官方存证链接：", -1)),
                createBaseVNode("a", {
                  href: (_a = currentCandidate.value) == null ? void 0 : _a.evidenceUrl,
                  target: "_blank"
                }, toDisplayString((_b = currentCandidate.value) == null ? void 0 : _b.evidenceUrl), 9, _hoisted_99)
              ])
            ]),
            createBaseVNode("div", _hoisted_100, [
              createBaseVNode("button", {
                class: "modal-cancel-btn",
                onClick: _cache[21] || (_cache[21] = ($event) => showApproveModal.value = false)
              }, "取消"),
              createBaseVNode("button", {
                class: "modal-submit-btn",
                onClick: submitApprove
              }, "确认并通过发布")
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const ModelsAdminView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-eb686d94"]]);
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 1. AI 模型监控站核心路由
    { path: "/", name: "ai-home", component: AiHomeView, meta: { title: "AI 模型动态监控站 · 全球重点厂商发布追踪" } },
    { path: "/models", name: "ai-models", component: AiModelsView, meta: { title: "大模型目录档案 · AI 模型动态站" } },
    { path: "/models/:id", name: "ai-model-detail", component: AiModelDetailView, meta: { title: "模型详情与演进 · AI 模型动态站" } },
    { path: "/vendors", name: "ai-vendors", component: AiVendorsView, meta: { title: "重点 AI 厂商目录 · AI 模型动态站" } },
    { path: "/vendors/:slug", name: "ai-vendor-detail", component: AiVendorDetailView, meta: { title: "厂商模型发布详情 · AI 模型动态站" } },
    { path: "/model-timeline", name: "ai-timeline", component: AiTimelineView, meta: { title: "模型发布历史时间线 · AI 模型动态站" } },
    // 2. 个人博客与次级栏目路由 (保留全部业务能力)
    { path: "/about", name: "about", component: AboutView, meta: { title: "关于博主 · Simon" } },
    { path: "/articles", name: "articles", component: ArticlesView, meta: { title: "全部手记 · Simon" } },
    { path: "/articles/:id", name: "article-detail", component: ArticleDetailView, meta: { title: "手记详情 · Simon" } },
    { path: "/works", name: "works", component: WorksView, meta: { title: "开源与作品 · Simon" } },
    { path: "/archives", name: "archives", component: ArchiveView, meta: { title: "手记归档 · Simon" } },
    // 3. 管理端路由
    { path: "/admin/login", name: "admin-login", component: LoginView, meta: { title: "管理员登录 · 控制台" } },
    { path: "/admin/models", name: "admin-models", component: ModelsAdminView, meta: { requiresAuth: true, title: "模型监控与审核 · 控制台" } },
    { path: "/admin/articles", name: "admin-articles", component: ArticleManageView, meta: { requiresAuth: true, title: "文章管理 · 控制台" } },
    { path: "/admin/articles/new", name: "admin-article-new", component: ArticleEditView, meta: { requiresAuth: true, title: "撰写新博文 · 控制台" } },
    { path: "/admin/articles/edit/:id", name: "admin-article-edit", component: ArticleEditView, meta: { requiresAuth: true, title: "编辑博文 · 控制台" } },
    { path: "/admin/works", name: "admin-works", component: WorkManageView, meta: { requiresAuth: true, title: "作品管理 · 控制台" } },
    // 404 兜底
    { path: "/:pathMatch(.*)*", redirect: "/" }
  ]
});
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.meta && to.meta.requiresAuth) {
    if (!authApi.isLoggedIn()) {
      next({ path: "/admin/login", query: { redirect: to.fullPath } });
      return;
    }
  }
  next();
});
createApp(_sfc_main$h).use(router).mount("#app");
