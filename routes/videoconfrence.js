const router = require("express").Router();

const KJUR = require("jsrsasign");

router.post("/jwt", (req, res) => {
  // Set the required parameters for generating the JWT
  const key = process.env.ZOOM_API_KEY;
  const secret = process.env.ZOOM_API_SECRET;
  const meetingNumber = 213365;
  const role = 0;

  // Generate the JWT
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload = {
    sdkKey: key,
    appKey: key,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    tokenExp: exp,
  };
  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, secret);

  // Return the JWT to the client
  res.json({ jwt: sdkJWT });
});

module.exports = router;
