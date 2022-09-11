import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { decode, verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-lsvvgmr2.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if (!jwt || !jwt.header || !jwt.header.kid || !jwt.header.alg || jwt.header.alg !== 'RS256' ) {
    throw new Error('invalid token');
  }

  const keyId:string = jwt.header.kid

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  // Get keys from Auth0
  const jwks = await Axios.get(jwksUrl).then(res => res.data);

  // Get Certificate
  const cert:string = getSingingKey(jwks, keyId);

  if(!cert) throw new Error('Invalid token')

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  return split[1]
}

function getSingingKey(jwks: any, kid: string): string {
  const signingKeys = jwks.keys.filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
    && key.kty === 'RSA' // We are only supporting RSA (RS256)
    && key.kid           // The `kid` must be present to be useful for later
    && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
  ).map(key => {
    return certToPEM(key.x5c[0]);
  });
  return signingKeys.find(key => key.kid === kid);
}

function certToPEM(cert): string {
  cert = cert.match(/.{1,64}/g).join(`

`);
  cert = `-----BEGIN CERTIFICATE-----

${cert}

-----END CERTIFICATE-----\n`;
  return cert;
}
