import { Noise } from "./noise";

describe("Noise", () => {
  it("randomNumber() generates consistent output given seed and step", () => {
    const noise1 = new Noise();
    noise1.init("foo");
    const set1 = [];
    for (let i = 0; i < 2; i++) {
      set1.push(noise1.randomNumber(i));
      set1.push(noise1.randomNumber(i));
    }

    const noise2 = new Noise();
    noise2.init("bar");
    const set2 = [];
    for (let i = 0; i < 2; i++) {
      set2.push(noise2.randomNumber(i));
      set2.push(noise2.randomNumber(i));
    }

    expect(set1[0]).toBe(set1[1]);
    expect(set1[2]).toBe(set1[3]);
    expect(set1[0]).not.toBe(set1[2]);

    expect(set1[0]).not.toBe(set2[0]);
    expect(set2[0]).toBe(set2[1]);
    expect(set2[2]).toBe(set2[3]);
  });

  it("randomNumber() generates numbers within the min and max", () => {
    const noise = new Noise();
    noise.init("random-seed");

    for (let i = 0; i < 50; i++) {
      const rand = noise.randomNumber(i);
      expect(rand > 0 && rand < 1).toBe(true);
    }

    for (let i = 0; i < 50; i++) {
      const rand = noise.randomNumber(i, 5, 10);
      expect(rand > 5 && rand < 10).toBe(true);
    }
  });
});
