import { Buffer } from 'buffer';

export type Value =
  | null
  | string
  | number
  | boolean
  | undefined
  | Value[]
  | { [key: string]: Value }
  | Map<Value, Value>
  | Set<Value>
  | Buffer
  | Date;

export function serialize(value: Value): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value === undefined) {
    // JSON does not support undefined, so keep it as undefined
    return undefined;
  }

  if (value instanceof Date) {
    return { __t: 'Date', __v: value.getTime() };
  }

  if (Buffer.isBuffer(value)) {
    return { __t: 'Buffer', __v: Array.from(value) };
  }

  if (value instanceof Map) {
    return {
      __t: 'Map',
      __v: Array.from(value.entries()).map(([k, v]) => [serialize(k), serialize(v)]),
    };
  }

  if (value instanceof Set) {
    return {
      __t: 'Set',
      __v: Array.from(value.values()).map(serialize),
    };
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === 'object') {
    const obj: { [key: string]: unknown } = {};
    for (const [k, v] of Object.entries(value)) {
      obj[k] = serialize(v);
    }
    return obj;
  }

  // Fallback (should not happen)
  return value;
}
export function deserialize(value: unknown): Value {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === undefined
  ) {
    return value as Value;
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as any;

    if (obj.__t === 'Date' && typeof obj.__v === 'number') {
      return new Date(obj.__v);
    }

    if (obj.__t === 'Buffer' && Array.isArray(obj.__v)) {
      return Buffer.from(obj.__v);
    }

    if (obj.__t === 'Map' && Array.isArray(obj.__v)) {
      const map = new Map();
      for (const [k, v] of obj.__v) {
        map.set(deserialize(k), deserialize(v));
      }
      return map;
    }

    if (obj.__t === 'Set' && Array.isArray(obj.__v)) {
      return new Set(obj.__v.map(deserialize));
    }

    if (Array.isArray(value)) {
      return value.map(deserialize);
    }

    const result: { [key: string]: Value } = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = deserialize(v);
    }
    return result;
  }

  // Fallback (should not happen)
  return value as Value;
}
