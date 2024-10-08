import "./chunk-BUSYA2B4.js";

// node_modules/ts-pattern/dist/index.js
var t = Symbol.for("@ts-pattern/matcher");
var e = Symbol.for("@ts-pattern/isVariadic");
var n = "@ts-pattern/anonymous-select-key";
var r = (t2) => Boolean(t2 && "object" == typeof t2);
var i = (e2) => e2 && !!e2[t];
var o = (n2, s2, c2) => {
  if (i(n2)) {
    const e2 = n2[t](), { matched: r2, selections: i2 } = e2.match(s2);
    return r2 && i2 && Object.keys(i2).forEach((t2) => c2(t2, i2[t2])), r2;
  }
  if (r(n2)) {
    if (!r(s2)) return false;
    if (Array.isArray(n2)) {
      if (!Array.isArray(s2)) return false;
      let t2 = [], r2 = [], a2 = [];
      for (const o2 of n2.keys()) {
        const s3 = n2[o2];
        i(s3) && s3[e] ? a2.push(s3) : a2.length ? r2.push(s3) : t2.push(s3);
      }
      if (a2.length) {
        if (a2.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (s2.length < t2.length + r2.length) return false;
        const e2 = s2.slice(0, t2.length), n3 = 0 === r2.length ? [] : s2.slice(-r2.length), i2 = s2.slice(t2.length, 0 === r2.length ? Infinity : -r2.length);
        return t2.every((t3, n4) => o(t3, e2[n4], c2)) && r2.every((t3, e3) => o(t3, n3[e3], c2)) && (0 === a2.length || o(a2[0], i2, c2));
      }
      return n2.length === s2.length && n2.every((t3, e2) => o(t3, s2[e2], c2));
    }
    return Object.keys(n2).every((e2) => {
      const r2 = n2[e2];
      return (e2 in s2 || i(a2 = r2) && "optional" === a2[t]().matcherType) && o(r2, s2[e2], c2);
      var a2;
    });
  }
  return Object.is(s2, n2);
};
var s = (e2) => {
  var n2, o2, a2;
  return r(e2) ? i(e2) ? null != (n2 = null == (o2 = (a2 = e2[t]()).getSelectionKeys) ? void 0 : o2.call(a2)) ? n2 : [] : Array.isArray(e2) ? c(e2, s) : c(Object.values(e2), s) : [];
};
var c = (t2, e2) => t2.reduce((t3, n2) => t3.concat(e2(n2)), []);
function a(...t2) {
  if (1 === t2.length) {
    const [e2] = t2;
    return (t3) => o(e2, t3, () => {
    });
  }
  if (2 === t2.length) {
    const [e2, n2] = t2;
    return o(e2, n2, () => {
    });
  }
  throw new Error(`isMatching wasn't given the right number of arguments: expected 1 or 2, received ${t2.length}.`);
}
function u(t2) {
  return Object.assign(t2, { optional: () => l(t2), and: (e2) => m(t2, e2), or: (e2) => d(t2, e2), select: (e2) => void 0 === e2 ? p(t2) : p(e2, t2) });
}
function h(t2) {
  return Object.assign(((t3) => Object.assign(t3, { [Symbol.iterator]() {
    let n2 = 0;
    const r2 = [{ value: Object.assign(t3, { [e]: true }), done: false }, { done: true, value: void 0 }];
    return { next: () => {
      var t4;
      return null != (t4 = r2[n2++]) ? t4 : r2.at(-1);
    } };
  } }))(t2), { optional: () => h(l(t2)), select: (e2) => h(void 0 === e2 ? p(t2) : p(e2, t2)) });
}
function l(e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return void 0 === t2 ? (s(e2).forEach((t3) => r2(t3, void 0)), { matched: true, selections: n2 }) : { matched: o(e2, t2, r2), selections: n2 };
  }, getSelectionKeys: () => s(e2), matcherType: "optional" }) });
}
var f = (t2, e2) => {
  for (const n2 of t2) if (!e2(n2)) return false;
  return true;
};
var g = (t2, e2) => {
  for (const [n2, r2] of t2.entries()) if (!e2(r2, n2)) return false;
  return true;
};
function m(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return { matched: e2.every((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "and" }) });
}
function d(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return c(e2, s).forEach((t3) => r2(t3, void 0)), { matched: e2.some((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "or" }) });
}
function y(e2) {
  return { [t]: () => ({ match: (t2) => ({ matched: Boolean(e2(t2)) }) }) };
}
function p(...e2) {
  const r2 = "string" == typeof e2[0] ? e2[0] : void 0, i2 = 2 === e2.length ? e2[1] : "string" == typeof e2[0] ? void 0 : e2[0];
  return u({ [t]: () => ({ match: (t2) => {
    let e3 = { [null != r2 ? r2 : n]: t2 };
    return { matched: void 0 === i2 || o(i2, t2, (t3, n2) => {
      e3[t3] = n2;
    }), selections: e3 };
  }, getSelectionKeys: () => [null != r2 ? r2 : n].concat(void 0 === i2 ? [] : s(i2)) }) });
}
function v(t2) {
  return "number" == typeof t2;
}
function b(t2) {
  return "string" == typeof t2;
}
function w(t2) {
  return "bigint" == typeof t2;
}
var S = u(y(function(t2) {
  return true;
}));
var O = S;
var j = (t2) => Object.assign(u(t2), { startsWith: (e2) => {
  return j(m(t2, (n2 = e2, y((t3) => b(t3) && t3.startsWith(n2)))));
  var n2;
}, endsWith: (e2) => {
  return j(m(t2, (n2 = e2, y((t3) => b(t3) && t3.endsWith(n2)))));
  var n2;
}, minLength: (e2) => j(m(t2, ((t3) => y((e3) => b(e3) && e3.length >= t3))(e2))), length: (e2) => j(m(t2, ((t3) => y((e3) => b(e3) && e3.length === t3))(e2))), maxLength: (e2) => j(m(t2, ((t3) => y((e3) => b(e3) && e3.length <= t3))(e2))), includes: (e2) => {
  return j(m(t2, (n2 = e2, y((t3) => b(t3) && t3.includes(n2)))));
  var n2;
}, regex: (e2) => {
  return j(m(t2, (n2 = e2, y((t3) => b(t3) && Boolean(t3.match(n2))))));
  var n2;
} });
var E = j(y(b));
var K = (t2) => Object.assign(u(t2), { between: (e2, n2) => K(m(t2, ((t3, e3) => y((n3) => v(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => K(m(t2, ((t3) => y((e3) => v(e3) && e3 < t3))(e2))), gt: (e2) => K(m(t2, ((t3) => y((e3) => v(e3) && e3 > t3))(e2))), lte: (e2) => K(m(t2, ((t3) => y((e3) => v(e3) && e3 <= t3))(e2))), gte: (e2) => K(m(t2, ((t3) => y((e3) => v(e3) && e3 >= t3))(e2))), int: () => K(m(t2, y((t3) => v(t3) && Number.isInteger(t3)))), finite: () => K(m(t2, y((t3) => v(t3) && Number.isFinite(t3)))), positive: () => K(m(t2, y((t3) => v(t3) && t3 > 0))), negative: () => K(m(t2, y((t3) => v(t3) && t3 < 0))) });
var x = K(y(v));
var A = (t2) => Object.assign(u(t2), { between: (e2, n2) => A(m(t2, ((t3, e3) => y((n3) => w(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => A(m(t2, ((t3) => y((e3) => w(e3) && e3 < t3))(e2))), gt: (e2) => A(m(t2, ((t3) => y((e3) => w(e3) && e3 > t3))(e2))), lte: (e2) => A(m(t2, ((t3) => y((e3) => w(e3) && e3 <= t3))(e2))), gte: (e2) => A(m(t2, ((t3) => y((e3) => w(e3) && e3 >= t3))(e2))), positive: () => A(m(t2, y((t3) => w(t3) && t3 > 0))), negative: () => A(m(t2, y((t3) => w(t3) && t3 < 0))) });
var P = A(y(w));
var T = u(y(function(t2) {
  return "boolean" == typeof t2;
}));
var k = u(y(function(t2) {
  return "symbol" == typeof t2;
}));
var B = u(y(function(t2) {
  return null == t2;
}));
var _ = u(y(function(t2) {
  return null != t2;
}));
var N = { __proto__: null, matcher: t, optional: l, array: function(...e2) {
  return h({ [t]: () => ({ match: (t2) => {
    if (!Array.isArray(t2)) return { matched: false };
    if (0 === e2.length) return { matched: true };
    const n2 = e2[0];
    let r2 = {};
    if (0 === t2.length) return s(n2).forEach((t3) => {
      r2[t3] = [];
    }), { matched: true, selections: r2 };
    const i2 = (t3, e3) => {
      r2[t3] = (r2[t3] || []).concat([e3]);
    };
    return { matched: t2.every((t3) => o(n2, t3, i2)), selections: r2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : s(e2[0]) }) });
}, set: function(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    if (!(t2 instanceof Set)) return { matched: false };
    let n2 = {};
    if (0 === t2.size) return { matched: true, selections: n2 };
    if (0 === e2.length) return { matched: true };
    const r2 = (t3, e3) => {
      n2[t3] = (n2[t3] || []).concat([e3]);
    }, i2 = e2[0];
    return { matched: f(t2, (t3) => o(i2, t3, r2)), selections: n2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : s(e2[0]) }) });
}, map: function(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    if (!(t2 instanceof Map)) return { matched: false };
    let n2 = {};
    if (0 === t2.size) return { matched: true, selections: n2 };
    const r2 = (t3, e3) => {
      n2[t3] = (n2[t3] || []).concat([e3]);
    };
    if (0 === e2.length) return { matched: true };
    var i2;
    if (1 === e2.length) throw new Error(`\`P.map\` wasn't given enough arguments. Expected (key, value), received ${null == (i2 = e2[0]) ? void 0 : i2.toString()}`);
    const [s2, c2] = e2;
    return { matched: g(t2, (t3, e3) => {
      const n3 = o(s2, e3, r2), i3 = o(c2, t3, r2);
      return n3 && i3;
    }), selections: n2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : [...s(e2[0]), ...s(e2[1])] }) });
}, intersection: m, union: d, not: function(e2) {
  return u({ [t]: () => ({ match: (t2) => ({ matched: !o(e2, t2, () => {
  }) }), getSelectionKeys: () => [], matcherType: "not" }) });
}, when: y, select: p, any: S, _: O, string: E, number: x, bigint: P, boolean: T, symbol: k, nullish: B, nonNullable: _, instanceOf: function(t2) {
  return u(y(/* @__PURE__ */ function(t3) {
    return (e2) => e2 instanceof t3;
  }(t2)));
}, shape: function(t2) {
  return u(y(a(t2)));
} };
var W = { matched: false, value: void 0 };
function $(t2) {
  return new z(t2, W);
}
var z = class _z {
  constructor(t2, e2) {
    this.input = void 0, this.state = void 0, this.input = t2, this.state = e2;
  }
  with(...t2) {
    if (this.state.matched) return this;
    const e2 = t2[t2.length - 1], r2 = [t2[0]];
    let i2;
    3 === t2.length && "function" == typeof t2[1] ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
    let s2 = false, c2 = {};
    const a2 = (t3, e3) => {
      s2 = true, c2[t3] = e3;
    }, u2 = !r2.some((t3) => o(t3, this.input, a2)) || i2 && !Boolean(i2(this.input)) ? W : { matched: true, value: e2(s2 ? n in c2 ? c2[n] : c2 : this.input, this.input) };
    return new _z(this.input, u2);
  }
  when(t2, e2) {
    if (this.state.matched) return this;
    const n2 = Boolean(t2(this.input));
    return new _z(this.input, n2 ? { matched: true, value: e2(this.input, this.input) } : W);
  }
  otherwise(t2) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  exhaustive() {
    if (this.state.matched) return this.state.value;
    let t2;
    try {
      t2 = JSON.stringify(this.input);
    } catch (e2) {
      t2 = this.input;
    }
    throw new Error(`Pattern matching error: no pattern matches value ${t2}`);
  }
  run() {
    return this.exhaustive();
  }
  returnType() {
    return this;
  }
};
export {
  N as P,
  N as Pattern,
  a as isMatching,
  $ as match
};
//# sourceMappingURL=ts-pattern.js.map
