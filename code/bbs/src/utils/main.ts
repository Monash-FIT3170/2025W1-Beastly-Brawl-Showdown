import "./RoomMethods";
import Sqids from "sqids";

const CODE_MIN_LENGTH = 6; // TODO use a global / db record
const CODE_ALPHABET = "0123456789";

/** Initialize new sqids object */
export const sqids = new Sqids({
  minLength: CODE_MIN_LENGTH,
  alphabet: CODE_ALPHABET,
});
