import crypto from 'crypto';

export class ObjectId {
  private static readonly RANDOM_BYTES = crypto.randomBytes(4); // 4 bytes random per process
  private static counter = crypto.randomBytes(3).readUIntBE(0, 3); // 3 byte random start

  private data: Buffer;

  constructor(type: number, timestamp: number) {
    this.data = Buffer.alloc(14);

    // 1 byte type
    this.data.writeUInt8(type & 0xff, 0);

    // 6 bytes timestamp (milliseconds since Unix epoch)
    const tsBigInt = BigInt(timestamp);
    for (let i = 0; i < 6; i++) {
      this.data[1 + i] = Number((tsBigInt >> BigInt(8 * (5 - i))) & BigInt(0xff));
    }

    // 4 bytes random (fixed per process)
    // Use Uint8Array.set instead of Buffer.copy to avoid type errors
    this.data.set(ObjectId.RANDOM_BYTES, 7);

    // 3 bytes counter (incrementing)
    ObjectId.counter = (ObjectId.counter + 1) & 0xffffff; // keep it 3 bytes
    this.data.writeUIntBE(ObjectId.counter, 11, 3);
  }


 
  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }

  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}
