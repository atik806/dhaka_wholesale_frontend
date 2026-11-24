import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScriptModule } from "./load-typescript.mjs";

const { normalizeBdMobile, validateShipping } = await loadTypeScriptModule(
  new URL("../src/lib/checkout-validation.ts", import.meta.url),
);

const valid = {
  firstName: "Test",
  lastName: "Customer",
  email: "test@example.com",
  phone: "+880 1712-345678",
  address: "House 12, Road 4",
  city: "Dhaka",
  zipCode: "1205",
};

test("Bangladeshi mobile numbers normalise the same way as the API", () => {
  assert.equal(normalizeBdMobile("01712345678"), "01712345678");
  assert.equal(normalizeBdMobile("+8801712345678"), "01712345678");
  assert.equal(normalizeBdMobile("017-1234 5678"), "01712345678");
  assert.equal(normalizeBdMobile("0171234567"), null);
  assert.equal(normalizeBdMobile("02712345678"), null);
});

test("a complete Bangladeshi address passes", () => {
  assert.deepEqual(validateShipping(valid), {});
});

test("an invalid phone and short address are reported per field", () => {
  const errors = validateShipping({ ...valid, phone: "12345", address: "Dhk" });
  assert.deepEqual(Object.keys(errors).sort(), ["address", "phone"]);
});

test("name, mobile and address are enough", () => {
  const errors = validateShipping({
    firstName: "Rahim Uddin", lastName: "", email: "", phone: "01712345678",
    address: "House 1, Road 2, Mirpur", city: "", zipCode: "",
  });
  assert.deepEqual(errors, {});
});

test("an empty form asks for name, mobile and address only", () => {
  const errors = validateShipping({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", zipCode: "",
  });
  assert.deepEqual(Object.keys(errors).sort(), ["address", "firstName", "phone"]);
});
