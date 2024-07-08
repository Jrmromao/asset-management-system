import { StatusCodes, ReasonPhrases } from "http-status-codes"
import { validateAuthHeader } from "lib/auth-utils"
import verifyPublicAuthKey from "lib/public-auth/verify-key.mjs"

export default async function handler(req, res) {
  try {
    // if request params has auth_type=public then use lib/public-auth/verify-key.mjs to verify a key
    const authType = req.query.auth_type
    if (authType === "public") {
      const authKey = req.query.auth_key
      const userId = req.query.user_id
      if (authKey && userId) {
        const verified = await verifyPublicAuthKey(userId, authKey)
        if (verified) {
          res.status(StatusCodes.OK).json({ isValid: true, clientId: userId })
          return
        }
      }
    }
  } catch (err) {
    console.error(`/api/auth/validate-key error -> `, err)
  }

  const authHeader = req.headers["authorization"]

  const { isValid, error, clientId } = await validateAuthHeader(authHeader)

  if (!isValid) {
    console.error(`/api/auth/validate-key error -> `, error)
    res.status(StatusCodes.UNAUTHORIZED).json({
      isValid: false,
      error: ReasonPhrases.UNAUTHORIZED
    })
  } else {
    res.status(StatusCodes.OK).json({ isValid: true, clientId })
  }
}
